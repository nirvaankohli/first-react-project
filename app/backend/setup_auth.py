#!/usr/bin/env python3
"""
Setup script for authentication system
Generates API key and creates .env file if needed
"""

import os
import secrets
from dotenv import load_dotenv

def generate_api_key():
    """Generate a secure API key"""
    return secrets.token_urlsafe(32)

def setup_auth():
    """Setup authentication system"""
    load_dotenv()
    
    # Check if API key already exists
    api_key = os.getenv("APP_API_KEY")
    
    if not api_key:
        # Generate new API key
        api_key = generate_api_key()
        
        # Create or append to .env file
        env_content = f"APP_API_KEY={api_key}\n"
        
        # Check if .env file exists
        if os.path.exists('.env'):
            # Read existing content
            with open('.env', 'r') as f:
                existing_content = f.read()
            
            # Check if APP_API_KEY already exists
            if 'APP_API_KEY=' not in existing_content:
                # Append to existing file
                with open('.env', 'a') as f:
                    f.write(f'\nAPP_API_KEY={api_key}\n')
            else:
                print("API key already exists in .env file")
                return
        else:
            # Create new .env file
            with open('.env', 'w') as f:
                f.write(env_content)
        
        print(f"✅ Generated new API key: {api_key}")
        print("🔐 Authentication system is now ready!")
        print("📝 The API key has been saved to .env file")
    else:
        print(f"✅ API key already exists: {api_key[:20]}...")
        print("🔐 Authentication system is ready!")

if __name__ == "__main__":
    setup_auth() 