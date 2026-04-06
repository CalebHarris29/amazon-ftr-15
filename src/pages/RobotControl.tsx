import React, { useState, useEffect, useRef } from 'react';
import * as ROSLIB from 'roslib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, Wifi, WifiOff, Home, ArrowDownToLine, Play, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function RobotControl() {
    const [url, setUrl] = useState('ws://localhost:9090');
    const [isConnected, setIsConnected] = useState(false);
    const [chatterMessages, setChatterMessages] = useState<string[]>([]);
    const [activePose, setActivePose] = useState<string | null>(null);
    const rosRef = useRef<ROSLIB.Ros | null>(null);
    const chatterRef = useRef<ROSLIB.Topic | null>(null);
    const poseCommandRef = useRef<ROSLIB.Topic | null>(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
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

                // Setup pose command publisher
                poseCommandRef.current = new ROSLIB.Topic({
                    ros: ros,
                    name: '/pose_command', // A generic string topic
                    messageType: 'std_msgs/String'
                });

                // Setup chatter subscriber
                chatterRef.current = new ROSLIB.Topic({
                    ros: ros,
                    name: '/chatter',
                    messageType: 'std_msgs/String'
                });

                chatterRef.current.subscribe((message: any) => {
                    setChatterMessages((prev) => [...prev.slice(-9), message.data]);
                });
            });

            ros.on('error', (error) => {
                console.error('ROS Connection Error:', error);
                toast.error('Error connecting to ROS server.');
            });

            ros.on('close', () => {
                setIsConnected(false);
                toast.info('Disconnected from ROS server.');
                poseCommandRef.current = null;
                if (chatterRef.current) {
                    chatterRef.current.unsubscribe();
                    chatterRef.current = null;
                }
            });

            rosRef.current = ros;
        } catch (e) {
            console.error(e);
            toast.error('Failed to parse URL or initialize connection.');
        }
    };

    const disconnect = () => {
        if (rosRef.current) {
            if (chatterRef.current) {
                chatterRef.current.unsubscribe();
            }
            rosRef.current.close();
            rosRef.current = null;
        }
    };

    const publishPose = (poseName: string) => {
        setActivePose(poseName);
        if (!isConnected || !poseCommandRef.current) {
            toast.warning('Not connected to robot.');
            return;
        }

        // @ts-expect-error ROSLIB typing missing in older versions
        const msg = new ROSLIB.Message({
            data: poseName
        });

        try {
            poseCommandRef.current.publish(msg);
            toast.success(`Sent command to move to ${poseName}`);
        } catch (e) {
            console.error('Failed to publish pose', e);
            toast.error('Failed to send pose command.');
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Robot Control Operator</h1>
                    <p className="text-muted-foreground">Administer and teleoperate connected ROS robots.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Connection Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wifi className="w-5 h-5" /> Connection Settings
                        </CardTitle>
                        <CardDescription>Connect to the rosbridge websocket server.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ws-url">WebSocket URL</Label>
                            <Input
                                id="ws-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="ws://192.168.1.100:9090"
                                disabled={isConnected}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                        {isConnected ? (
                            <Button variant="destructive" onClick={disconnect} className="gap-2">
                                <WifiOff className="w-4 h-4" /> Disconnect
                            </Button>
                        ) : (
                            <Button onClick={connect} className="gap-2">
                                <Wifi className="w-4 h-4" /> Connect
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Pose Control Panel */}
                <Card className={!isConnected ? 'opacity-50 pointer-events-none' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> Pre-Programmed Poses
                        </CardTitle>
                        <CardDescription>Send predefined trajectory goals to the Kinova Arm.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button 
                            variant={activePose === 'Home' ? 'default' : 'outline'} 
                            className="h-24 flex flex-col gap-2 transition-all hover:scale-105"
                            onClick={() => publishPose('Home')}
                        >
                            <Home className="w-6 h-6" />
                            Return Home
                        </Button>
                        <Button 
                            variant={activePose === 'Retract' ? 'default' : 'outline'} 
                            className="h-24 flex flex-col gap-2 transition-all hover:scale-105"
                            onClick={() => publishPose('Retract')}
                        >
                            <ArrowDownToLine className="w-6 h-6" />
                            Retract Arm
                        </Button>
                        <Button 
                            variant={activePose === 'Observe' ? 'default' : 'outline'} 
                            className="h-24 flex flex-col gap-2 transition-all hover:scale-105"
                            onClick={() => publishPose('Observe')}
                        >
                            <Play className="w-6 h-6" />
                            Observe Position
                        </Button>
                        <Button 
                            variant={activePose === 'Pick' ? 'default' : 'outline'} 
                            className="h-24 flex flex-col gap-2 transition-all hover:scale-105"
                            onClick={() => publishPose('Pick')}
                        >
                            <Zap className="w-6 h-6" />
                            Pick Object
                        </Button>
                    </CardContent>
                </Card>
                {/* Diagnostics / Chatter Panel */}
                <Card className={`col-span-1 md:col-span-2 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wifi className="w-5 h-5" /> Diagnostics Listener
                        </CardTitle>
                        <CardDescription>Listening for messages on the /chatter topic.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-md font-mono text-sm min-h-[150px] flex flex-col justify-end">
                            {chatterMessages.length === 0 ? (
                                <span className="text-muted-foreground italic">Waiting for messages...</span>
                            ) : (
                                chatterMessages.map((msg, idx) => (
                                    <div key={idx} className="text-green-600 dark:text-green-400">
                                        &gt; {msg}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
