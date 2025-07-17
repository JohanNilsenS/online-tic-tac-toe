#!/usr/bin/env python3
"""
Setup script for the Online Tic-Tac-Toe Backend

This script helps set up the backend environment and install dependencies.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully!")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🎮 Online Tic-Tac-Toe Backend Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("❌ Please run this script from the backend directory!")
        sys.exit(1)
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required!")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists('venv'):
        if not run_command('python -m venv venv', 'Creating virtual environment'):
            sys.exit(1)
    else:
        print("✅ Virtual environment already exists")
    
    # Determine the activation script path
    if os.name == 'nt':  # Windows
        activate_script = 'venv\\Scripts\\activate'
        pip_command = 'venv\\Scripts\\pip'
    else:  # Unix/Linux/macOS
        activate_script = 'venv/bin/activate'
        pip_command = 'venv/bin/pip'
    
    # Install dependencies
    if not run_command(f'{pip_command} install -r requirements.txt', 'Installing dependencies'):
        sys.exit(1)
    
    print("\n🎉 Backend setup completed successfully!")
    print("\nTo start the backend server:")
    print(f"1. Activate the virtual environment: {activate_script}")
    print("2. Run the server: python app.py")
    print("\nThe server will start on http://localhost:5000")

if __name__ == '__main__':
    main() 