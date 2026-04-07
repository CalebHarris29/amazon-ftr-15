from flask import Flask, request
from flask_cors import CORS
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import TwistStamped

# This file is meant to be executed on the Ubuntu Linux machine 
# hosting the ROS 2 Humble environment and the physical robot drivers.

app = Flask(__name__)
CORS(app) 

ros_node = None
twist_pub = None

def init_ros():
    global ros_node, twist_pub
    rclpy.init()
    ros_node = rclpy.create_node('http_joystick')
    # Connects to the Kinova Cartesian Velocity Controller
    twist_pub = ros_node.create_publisher(TwistStamped, '/twist_controller/commands', 10)

@app.route('/twist', methods=['POST', 'GET'])
def handle_twist():
    # Extract coordinates from the React HTTP request
    lx = float(request.args.get('lx', 0.0))
    ly = float(request.args.get('ly', 0.0))
    lz = float(request.args.get('lz', 0.0))
    
    # Format into a native ROS 2 physical geometry packet
    msg = TwistStamped()
    msg.header.frame_id = "base_link"
    msg.twist.linear.x = lx
    msg.twist.linear.y = ly
    msg.twist.linear.z = lz
    
    # Physically push the command to the robotic arm
    twist_pub.publish(msg)
    ros_node.get_logger().info(f"Fired Twist: X={lx}, Y={ly}, Z={lz}")
    
    return "OK", 200

if __name__ == '__main__':
    init_ros()
    print("🚀 Dual-Architecture Server is LIVE! Connect the React Dashboard...")
    # Exposing to 0.0.0.0 allows the Mac to connect over the Wi-Fi network
    app.run(host='0.0.0.0', port=5000)
    
    ros_node.destroy_node()
    rclpy.shutdown()
