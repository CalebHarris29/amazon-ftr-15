import React, { useState, useEffect, useRef } from 'react';
import * as ROSLIB from 'roslib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, Wifi, WifiOff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpFromLine, ArrowDownToLine, Octagon } from 'lucide-react';
import { toast } from 'sonner';

export default function RobotControl() {
    const [url, setUrl] = useState('ws://10.26.97.120:9090');
    const [isConnected, setIsConnected] = useState(false);
    const [chatterMessages, setChatterMessages] = useState<string[]>([]);
    const [activeDirection, setActiveDirection] = useState<string | null>(null);
    
    const rosRef = useRef<ROSLIB.Ros | null>(null);
    const chatterRef = useRef<ROSLIB.Topic | null>(null);
    const twistCommandRef = useRef<ROSLIB.Topic | null>(null);
    const jogIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Cleanup on unmount ensures robot stops if interface closes
        return () => {
            stopJogging();
            if (rosRef.current) {
                rosRef.current.close();
            }
        };
    }, []);

    const connect = () => {
        if (rosRef.current) {
            rosRef.current.close();
        }

        try {
            const ros = new ROSLIB.Ros({ url });

            ros.on('connection', () => {
                setIsConnected(true);
                toast.success('Connected to ROS websocket server.');

                // Setup Cartesian Twist publisher
                twistCommandRef.current = new ROSLIB.Topic({
                    ros: ros,
                    name: '/twist_controller/commands',
                    messageType: 'geometry_msgs/TwistStamped'
                });
                twistCommandRef.current.advertise();

                // Setup chatter subscriber for diagnostics
                chatterRef.current = new ROSLIB.Topic({
                    ros: ros,
                    name: '/chatter',
                    messageType: 'std_msgs/String' // or std_msgs/msg/String depending on your rosbridge
                });

                chatterRef.current.subscribe((message: any) => {
                    setChatterMessages((prev) => [...prev.slice(-9), message.data]);
                });
            });

            ros.on('error', (error) => {
                console.error('ROS Connection Error:', error);
                toast.error('Failed to connect to bridge.');
                setIsConnected(false);
            });

            ros.on('close', () => {
                setIsConnected(false);
                stopJogging();
            });

            rosRef.current = ros;
        } catch (e) {
            console.error('Connection instantiation failed', e);
            toast.error('Failed to parse URL or initialize connection.');
        }
    };

    const disconnect = () => {
        if (rosRef.current) {
            stopJogging();
            if (chatterRef.current) {
                chatterRef.current.unsubscribe();
            }
            rosRef.current.close();
            rosRef.current = null;
        }
    };

    const publishTwistHTTP = async (lx: number, ly: number, lz: number) => {
        try {
            // Dynamically strip the IP from 'ws://10.26.97.120:9090' -> '10.26.97.120'
            const ipAddress = url.replace('ws://', '').split(':')[0];
            const endpoint = `http://${ipAddress}:5000/twist?lx=${lx}&ly=${ly}&lz=${lz}&ax=0&ay=0&az=0`;
            
            await fetch(endpoint, { method: 'POST', mode: 'cors' });
        } catch (e) {
            console.error('Failed HTTP Injection:', e);
        }
    };

    const startJogging = (dir: string, lx: number, ly: number, lz: number) => {
        if (!isConnected) {
            toast.warning('Not connected to robot.');
            return;
        }
        
        setActiveDirection(dir);
        
        publishTwistHTTP(lx, ly, lz);
        
        if (jogIntervalRef.current) clearInterval(jogIntervalRef.current);
        
        jogIntervalRef.current = setInterval(() => {
            publishTwistHTTP(lx, ly, lz);
        }, 50);
    };

    const stopJogging = () => {
        setActiveDirection(null);
        if (jogIntervalRef.current) {
            clearInterval(jogIntervalRef.current);
            jogIntervalRef.current = null;
        }
        publishTwistHTTP(0, 0, 0);
        setTimeout(() => publishTwistHTTP(0, 0, 0), 50);
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Robot Control Operator</h1>
                    <p className="text-muted-foreground">Teleoperate physical ROS arms via High-Speed WebSockets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Connection Panel */}
                <Card className="md:col-span-12">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wifi className="w-5 h-5" /> Connection Settings
                        </CardTitle>
                        <CardDescription>Connect to the rosbridge websocket server on your Linux machine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end gap-4 max-w-md">
                            <div className="space-y-2 flex-grow">
                                <Label htmlFor="ws-url">WebSocket URL</Label>
                                <Input
                                    id="ws-url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="ws://10.26.97.120:9090"
                                    disabled={isConnected}
                                    className="font-mono"
                                />
                            </div>
                            <div className="pb-[2px]">
                                {isConnected ? (
                                    <Button variant="destructive" onClick={disconnect} className="gap-2 w-32">
                                        <WifiOff className="w-4 h-4" /> Disconnect
                                    </Button>
                                ) : (
                                    <Button onClick={connect} className="gap-2 w-32 bg-green-600 hover:bg-green-700">
                                        <Wifi className="w-4 h-4" /> Connect
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cartesian D-Pad Panel */}
                <Card className={`md:col-span-7 border-blue-500/20 shadow-blue-500/5 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArrowUpFromLine className="w-5 h-5 text-blue-500" /> 
                                Cartesian Joystick
                            </div>
                            {/* Emergency Stop */}
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={stopJogging}
                                className="uppercase font-bold tracking-widest text-xs"
                            >
                                <Octagon className="w-4 h-4 mr-2" />
                                Halt
                            </Button>
                        </CardTitle>
                        <CardDescription>Press and hold buttons to continuously stream velocity physics to the arm end-effector.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                        
                        <div className="flex gap-12 items-center">
                            {/* Z-Axis Controls (Vertical Column) */}
                            <div className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-3xl items-center border">
                                <Label className="text-xs font-bold text-slate-500 uppercase pb-2">Z-Axis (Elevate)</Label>
                                <Button 
                                    size="lg"
                                    variant={activeDirection === '+Z' ? 'default' : 'outline'}
                                    className={`w-16 h-16 rounded-full shadow-md active:scale-95 ${activeDirection === '+Z' ? 'bg-blue-600' : ''}`}
                                    onMouseDown={() => startJogging('+Z', 0, 0, 0.1)}
                                    onMouseUp={stopJogging}
                                    onMouseLeave={stopJogging}
                                >
                                    <ArrowUp className="w-8 h-8" />
                                </Button>
                                <div className="h-4"></div>
                                <Button 
                                    size="lg"
                                    variant={activeDirection === '-Z' ? 'default' : 'outline'}
                                    className={`w-16 h-16 rounded-full shadow-md active:scale-95 ${activeDirection === '-Z' ? 'bg-blue-600' : ''}`}
                                    onMouseDown={() => startJogging('-Z', 0, 0, -0.1)}
                                    onMouseUp={stopJogging}
                                    onMouseLeave={stopJogging}
                                >
                                    <ArrowDown className="w-8 h-8" />
                                </Button>
                            </div>

                            {/* X/Y Axis Controls (D-Pad Grid) */}
                            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-[3rem] border flex flex-col items-center relative shadow-inner">
                                <Label className="text-xs font-bold text-slate-500 uppercase absolute top-4">X/Y-Axis (Plane)</Label>
                                
                                <div className="grid grid-cols-3 gap-2 mt-6">
                                    <div />
                                    <Button 
                                        size="lg"
                                        variant={activeDirection === '+X' ? 'default' : 'outline'}
                                        className={`w-16 h-16 rounded-xl shadow-md active:scale-95 ${activeDirection === '+X' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('+X', 0.1, 0, 0)}
                                        onMouseUp={stopJogging}
                                        onMouseLeave={stopJogging}
                                    >
                                        <ArrowUp className="w-8 h-8" />
                                    </Button>
                                    <div />
                                    
                                    <Button 
                                        size="lg"
                                        variant={activeDirection === '+Y' ? 'default' : 'outline'}
                                        className={`w-16 h-16 rounded-xl shadow-md active:scale-95 ${activeDirection === '+Y' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('+Y', 0, 0.1, 0)}
                                        onMouseUp={stopJogging}
                                        onMouseLeave={stopJogging}
                                    >
                                        <ArrowLeft className="w-8 h-8" />
                                    </Button>
                                    <div className="w-16 h-16 flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                    </div>
                                    <Button 
                                        size="lg"
                                        variant={activeDirection === '-Y' ? 'default' : 'outline'}
                                        className={`w-16 h-16 rounded-xl shadow-md active:scale-95 ${activeDirection === '-Y' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('-Y', 0, -0.1, 0)}
                                        onMouseUp={stopJogging}
                                        onMouseLeave={stopJogging}
                                    >
                                        <ArrowRight className="w-8 h-8" />
                                    </Button>
                                    
                                    <div />
                                    <Button 
                                        size="lg"
                                        variant={activeDirection === '-X' ? 'default' : 'outline'}
                                        className={`w-16 h-16 rounded-xl shadow-md active:scale-95 ${activeDirection === '-X' ? 'bg-blue-600' : ''}`}
                                        onMouseDown={() => startJogging('-X', -0.1, 0, 0)}
                                        onMouseUp={stopJogging}
                                        onMouseLeave={stopJogging}
                                    >
                                        <ArrowDown className="w-8 h-8" />
                                    </Button>
                                    <div />
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Diagnostics / Chatter Panel */}
                <Card className={`md:col-span-5 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Wifi className="w-4 h-4" /> Diagnostics Stream
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-950 text-emerald-400 p-4 rounded-lg h-60 overflow-y-auto font-mono text-sm leading-relaxed shadow-inner border border-slate-800">
                            {chatterMessages.length === 0 ? (
                                <p className="text-slate-600 italic">No diagnostics received from /chatter...</p>
                            ) : (
                                chatterMessages.map((msg, idx) => (
                                    <p key={idx} className="opacity-90">{'>'} {msg}</p>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                
            </div>
        </div>
    );
}
