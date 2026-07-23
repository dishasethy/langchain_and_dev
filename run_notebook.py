import json
import os
import sys

def main():
    # Force UTF-8 output encoding for emojis and special characters on Windows
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    if len(sys.argv) < 2:
        print("Error: No input provided")
        sys.exit(1)
        
    # Check if first argument is a pipeline type
    pipeline_type = "joke"
    user_input = sys.argv[1]
    
    if len(sys.argv) >= 3:
        if sys.argv[1].lower() in ["joke", "db"]:
            pipeline_type = sys.argv[1].lower()
            user_input = sys.argv[2]
            
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    if pipeline_type == "db":
        notebook_path = os.path.join(current_dir, 'ReAct_agent', 'db_agent.ipynb')
    else:
        notebook_path = os.path.join(current_dir, 'basics', 'messages.ipynb')
        
    if not os.path.exists(notebook_path):
        print(f"Error: Notebook not found at {notebook_path}")
        sys.exit(1)
        
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        
    code_lines = []
    for cell in nb['cells']:
        if cell['cell_type'] == 'code':
            source = "".join(cell['source'])
            
            # Skip cells that use interactive input()
            if 'input(' in source:
                continue
                
            if pipeline_type == "db":
                # Fix relative database path to absolute path
                if 'sqlite:///SalesDB/sales.db' in source:
                    db_abs_path = os.path.abspath(os.path.join(current_dir, "ReAct_agent", "SalesDB", "sales.db"))
                    # Normalize backslashes for sqlite URI on Windows
                    db_abs_path = db_abs_path.replace("\\", "/")
                    source = source.replace('sqlite:///SalesDB/sales.db', f'sqlite:///{db_abs_path}')
                
                # Dynamically inject the user query in the agent invocation cell
                if 'example_query =' in source:
                    import re
                    # Replace whatever query is there
                    source = re.sub(r'example_query\s*=\s*["\'].*?["\']', f'example_query = """{user_input}"""', source)
            else:
                # Dynamically inject the topic into the joke notebook cells
                if 'Tell me a joke about ' in source:
                    source = source.replace('Tell me a joke about ', f'Tell me a joke about {user_input}')
                elif 'Tell me a joke about' in source:
                    source = source.replace('Tell me a joke about', f'Tell me a joke about {user_input}')
                elif 'llm.invoke("Tell me a joke")' in source:
                    source = source.replace('llm.invoke("Tell me a joke")', f'llm.invoke("Tell me a joke about {user_input}")')
                elif "llm.invoke('Tell me a joke')" in source:
                    source = source.replace("llm.invoke('Tell me a joke')", f"llm.invoke('Tell me a joke about {user_input}')")
                elif '"Tell me a joke"' in source:
                    source = source.replace('"Tell me a joke"', f'"Tell me a joke about {user_input}"')
                elif "'Tell me a joke'" in source:
                    source = source.replace("'Tell me a joke'", f"'Tell me a joke about {user_input}'")
            
            code_lines.append(source)
            
    full_code = "\n".join(code_lines)
    
    # Execute the extracted Python code using exec and capture output
    import io
    from contextlib import redirect_stdout
    
    output_capture = io.StringIO()
    
    with redirect_stdout(output_capture):
        try:
            globals_dict = {
                '__name__': '__main__',
                '__file__': notebook_path,
            }
            exec(full_code, globals_dict)
        except Exception as e:
            sys.stderr.write(f"Execution Error: {e}\n")
            sys.exit(1)
            
    print(output_capture.getvalue().strip())

if __name__ == '__main__':
    main()
