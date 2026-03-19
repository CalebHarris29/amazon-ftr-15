import React, { useState, useEffect, useRef } from 'react';
import * as ROSLIB from 'roslib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, Wifi, WifiOff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Disc } from 'lucide-react';
import { toast } from 'sonner';

export default function RobotControl() {
    const [url, setUrl] = useState('ws://localhost:9090');
    const [isConnected, setIsConnected] = useState(false);
    const rosRef = useRef<ROSLIB.Ros | null>(null);
    const cmdVelRef = useRef<ROSLIB.Topic | null>(null);

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

                // Setup cmd_vel publisher
                cmdVelRef.current = new ROSLIB.Topic({
                    ros: ros,
                    name: '/cmd_vel',
                    messageType: 'geometry_msgs/Twist'
                });
            });

            ros.on('error', (error) => {
                console.error('ROS Connection Error:', error);
                toast.error('Error connecting to ROS server.');
            });

            ros.on('close', () => {
                setIsConnected(false);
                toast.info('Disconnected from ROS server.');
                cmdVelRef.current = null;
            });

            rosRef.current = ros;
        } catch (e) {
            console.error(e);
            toast.error('Failed to parse URL or initialize connection.');
        }
    };

    const disconnect = () => {
        if (rosRef.current) {
            rosRef.current.close();
            rosRef.current = null;
        }
    };

    const publishTwist = (linearX: number, angularZ: number) => {
        if (!isConnected || !cmdVelRef.current) {
            toast.warning('Not connected to robot.');
            return;
        }

        // @ts-expect-error ROSLIB type definition might be missing Message but it exists in JS
        const twist = new ROSLIB.Message({
            linear: { x: linearX, y: 0.0, z: 0.0 },
            angular: { x: 0.0, y: 0.0, z: angularZ }
        });

        try {
            cmdVelRef.current.publish(twist);
        } catch (e) {
            console.error('Failed to publish', e);
            toast.error('Failed to send command.');
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

                {/* Teleoperation Panel */}
                <Card className={!isConnected ? 'opacity-50 pointer-events-none' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Disc className="w-5 h-5" /> Teleoperation
                        </CardTitle>
                        <CardDescription>Send velocity commands directly to /cmd_vel.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="grid grid-cols-3 gap-2">
                            {/* Top Row */}
                            <div />
                            <Button
                                variant="outline"
                                className="h-16 w-16"
                                onMouseDown={() => publishTwist(0.5, 0)}
                                onMouseUp={() => publishTwist(0, 0)}
                                onMouseLeave={() => publishTwist(0, 0)}
                            >
                                <ArrowUp className="w-6 h-6" />
                            </Button>
                            <div />

                            {/* Middle Row */}
                            <Button
                                variant="outline"
                                className="h-16 w-16"
                                onMouseDown={() => publishTwist(0, 0.5)}
                                onMouseUp={() => publishTwist(0, 0)}
                                onMouseLeave={() => publishTwist(0, 0)}
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-16 w-16"
                                onClick={() => publishTwist(0, 0)}
                            >
                                <Disc className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-16 w-16"
                                onMouseDown={() => publishTwist(0, -0.5)}
                                onMouseUp={() => publishTwist(0, 0)}
                                onMouseLeave={() => publishTwist(0, 0)}
                            >
                                <ArrowRight className="w-6 h-6" />
                            </Button>

                            {/* Bottom Row */}
                            <div />
                            <Button
                                variant="outline"
                                className="h-16 w-16"
                                onMouseDown={() => publishTwist(-0.5, 0)}
                                onMouseUp={() => publishTwist(0, 0)}
                                onMouseLeave={() => publishTwist(0, 0)}
                            >
                                <ArrowDown className="w-6 h-6" />
                            </Button>
                            <div />
                        </div>
                        <p className="text-xs text-muted-foreground mt-6 text-center">
                            Press and hold buttons to move the robot.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
