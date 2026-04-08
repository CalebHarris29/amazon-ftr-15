import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, Wifi, WifiOff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpFromLine, Octagon, Grab } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TelemetryData {
    status: string;
    battery: number;
    connection: string;
    currentTask: string;
    joints: number[];
    torques: number[];
}

export default function RobotControl() {
    const [ipAddress, setIpAddress] = useState(window.location.hostname);
    const [isConnected, setIsConnected] = useState(false);
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [torqueHistory, setTorqueHistory] = useState<any[]>([]);
    const [activeDirection, setActiveDirection] = useState<string | null>(null);
    
    const wsRef = useRef<WebSocket | null>(null);
    const jogIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            stopJogging();
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const connect = () => {
        if (wsRef.current) wsRef.current.close();

        try {
            const ws = new WebSocket(`ws://${ipAddress}:8000/ws`);

            ws.onopen = () => {
                setIsConnected(true);
                toast.success('Connected natively to Kortex FastAPI server.');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setTelemetry(data);
                
                // Track historical torque for the Recharts graph (Total avg to identify physical struggle/weight)
                if (data.torques && data.torques.length > 0) {
                    const avgTorque = data.torques.reduce((a: number,b: number) => a+Math.abs(b), 0) / data.torques.length;
                    setTorqueHistory(prev => {
                        const newHist = [...prev, { time: new Date().toLocaleTimeString().split(' ')[0], torque: avgTorque }];
                        return newHist.slice(-25); // Keep rolling window of last 25 ticks
                    });
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                toast.error('Failed to connect to robot stream.');
            };

            ws.onclose = () => {
                setIsConnected(false);
                setTelemetry(null);
                stopJogging();
            };

            wsRef.current = ws;
        } catch (e) {
            toast.error('Invalid URL or Connection failed.');
        }
    };

    const disconnect = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    const sendCommand = async (type: string) => {
        try {
            await fetch(`http://${ipAddress}:8000/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, speed: 0.1 }) // Faster base speed for manual UI
            });
        } catch (e) {
            console.error('Command failed:', e);
        }
    };

    const startJogging = (dirLabel: string, cmdType: string) => {
        if (!isConnected) return toast.warning('Not connected to robot.');
        
        setActiveDirection(dirLabel);
        sendCommand(cmdType);
    };

    const stopJogging = () => {
        setActiveDirection(null);
        if (isConnected) sendCommand('stop');
    };

    const triggerGripper = (action: 'gripper_open' | 'gripper_close') => {
        if (!isConnected) return toast.warning('Not connected to robot.');
        sendCommand(action);
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kortex Insight Dashboard</h1>
                    <p className="text-muted-foreground">Native FastAPI Telemetry & Control Interface.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Connection Panel */}
                <Card className="md:col-span-12 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="py-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Wifi className="w-5 h-5 text-blue-500" /> Connection Node
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end gap-4">
                        <div className="space-y-2 flex-grow max-w-sm">
                            <Label>FastAPI Server IP</Label>
                            <Input
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                placeholder="10.26.96.78"
                                disabled={isConnected}
                                className="font-mono bg-slate-50 dark:bg-slate-900"
                            />
                        </div>
                        {isConnected ? (
                            <Button variant="destructive" onClick={disconnect} className="gap-2 w-32 shadow-sm">
                                <WifiOff className="w-4 h-4" /> Disconnect
                            </Button>
                        ) : (
                            <Button onClick={connect} className="gap-2 w-32 bg-blue-600 hover:bg-blue-700 shadow-sm">
                                <Wifi className="w-4 h-4" /> Connect
                            </Button>
                        )}
                        {telemetry && (
                             <div className="ml-auto text-sm bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg border flex items-center gap-3">
                                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> {telemetry.status.toUpperCase()}</span>
                                 <span className="text-slate-400">|</span>
                                 <span>TASK: <span className="font-mono font-bold">{telemetry.currentTask}</span></span>
                             </div>
                        )}
                    </CardContent>
                </Card>

                {/* Left Column: Data & Insights (7 columns) */}
                <div className="md:col-span-7 flex flex-col gap-6">
                    <Card className={`border-emerald-500/20 shadow-emerald-500/5 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-4">
                            <CardTitle className="flex items-center justify-between text-lg">
                                <div className="flex items-center gap-2">
                                    <Grab className="w-5 h-5 text-emerald-500" /> 
                                    Real-Time Force/Torque Insights
                                </div>
                            </CardTitle>
                            <CardDescription>Visualizing absolute motor effort. Grasping an object causes visible spikes.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={torqueHistory}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="time" tick={{fontSize: 10}} opacity={0.5} />
                                    <YAxis label={{ value: 'Avg Torque (Nm)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#94a3b8' } }} tick={{fontSize: 10}} opacity={0.5} width={40} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="torque" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className={`${!isConnected ? 'opacity-50 pointer-events-none' : ''} shadow-sm border-slate-200 dark:border-slate-800`}>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Actuator Matrix</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-6 gap-2">
                                {telemetry?.torques?.map((t, i) => (
                                    <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center border overflow-hidden">
                                        <div className="text-[10px] text-slate-400 font-bold mb-1">MOTOR {i+1}</div>
                                        <div className="font-mono text-sm font-semibold truncate">{Math.abs(t).toFixed(1)} Nm</div>
                                    </div>
                                ))}
                                {!telemetry?.torques && Array(6).fill(0).map((_, i) => <div key={i} className="bg-slate-100 rounded-lg p-3 text-center opacity-50 dark:bg-slate-800"><div className="h-4"></div></div>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Controls (5 columns) */}
                <Card className={`md:col-span-5 border-blue-500/20 shadow-blue-500/5 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-4">
                        <CardTitle className="flex items-center justify-between text-lg">
                            <div className="flex items-center gap-2">
                                <ArrowUpFromLine className="w-5 h-5 text-blue-500" /> 
                                Kortex Teleoperation
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={stopJogging}
                                className="uppercase font-bold tracking-widest text-[10px] h-7"
                            >
                                <Octagon className="w-3 h-3 mr-1" /> Halt
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 py-6 border-b">
                        
                        <div className="flex justify-center gap-6">
                            {/* Z-Axis Controls */}
                            <div className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-4 rounded-3xl items-center border shadow-inner">
                                <Button 
                                    variant={activeDirection === '+Z' ? 'default' : 'outline'}
                                    className={`w-14 h-14 rounded-full shadow-sm active:scale-95 ${activeDirection === '+Z' ? 'bg-blue-600' : ''}`}
                                    onMouseDown={() => startJogging('+Z', 'move_up')}
                                    onMouseUp={stopJogging} onMouseLeave={stopJogging}
                                >
                                    <ArrowUp className="w-6 h-6" />
                                </Button>
                                <div className="h-4 text-[9px] font-bold text-slate-400 rotate-90 tracking-widest">Z-AXIS</div>
                                <Button 
                                    variant={activeDirection === '-Z' ? 'default' : 'outline'}
                                    className={`w-14 h-14 rounded-full shadow-sm active:scale-95 ${activeDirection === '-Z' ? 'bg-blue-600' : ''}`}
                                    onMouseDown={() => startJogging('-Z', 'move_down')}
                                    onMouseUp={stopJogging} onMouseLeave={stopJogging}
                                >
                                    <ArrowDown className="w-6 h-6" />
                                </Button>
                            </div>

                            {/* X/Y Controls */}
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-[2.5rem] border flex flex-col items-center justify-center shadow-inner">
                                <div className="grid grid-cols-3 gap-2">
                                    <div />
                                    <Button 
                                        variant={activeDirection === '+X' ? 'default' : 'outline'}
                                        className={`w-14 h-14 rounded-xl shadow-sm active:scale-95 ${activeDirection === '+X' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('+X', 'move_forward')}
                                        onMouseUp={stopJogging} onMouseLeave={stopJogging}
                                    >
                                        <ArrowUp className="w-6 h-6" />
                                    </Button>
                                    <div />
                                    <Button 
                                        variant={activeDirection === '+Tilt' ? 'default' : 'outline'}
                                        className={`w-14 h-14 rounded-xl shadow-sm active:scale-95 ${activeDirection === '+Tilt' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('+Tilt', 'tilt_up')}
                                        onMouseUp={stopJogging} onMouseLeave={stopJogging}
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </Button>
                                    <div className="w-14 h-14 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                    </div>
                                    <Button 
                                        variant={activeDirection === '-Tilt' ? 'default' : 'outline'}
                                        className={`w-14 h-14 rounded-xl shadow-sm active:scale-95 ${activeDirection === '-Tilt' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('-Tilt', 'tilt_down')}
                                        onMouseUp={stopJogging} onMouseLeave={stopJogging}
                                    >
                                        <ArrowRight className="w-6 h-6" />
                                    </Button>
                                    <div />
                                    <Button 
                                        variant={activeDirection === '-X' ? 'default' : 'outline'}
                                        className={`w-14 h-14 rounded-xl shadow-sm active:scale-95 ${activeDirection === '-X' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('-X', 'move_backward')}
                                        onMouseUp={stopJogging} onMouseLeave={stopJogging}
                                    >
                                        <ArrowDown className="w-6 h-6" />
                                    </Button>
                                    <div />
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    {/* Gripper Override */}
                    <div className="p-6 bg-white dark:bg-slate-950 rounded-b-xl text-center">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Gripper Actuation Override</Label>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" className="w-full bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-300" onClick={() => triggerGripper('gripper_open')}>
                                Release Clamp
                            </Button>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => triggerGripper('gripper_close')}>
                                Close Clamp
                            </Button>
                        </div>
                    </div>
                </Card>
                
            </div>
        </div>
    );
}
