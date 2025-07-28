

import os

def create_env_file():

    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_path):

        return
    

    env_content = """OPENAI_API_KEY="""
    
    with open(env_path, 'w') as f:
        
        f.write(env_content)
    
    print("✅ Created .env file")
    
if __name__ == "__main__":
    create_env_file() 