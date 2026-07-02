import json
import os
import sys

def main():
    if len(sys.argv) < 2:
        print("Error: No topic provided")
        sys.exit(1)
    
    topic = sys.argv[1]
    
    # Path to the notebook
    current_dir = os.path.dirname(os.path.abspath(__file__))
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
            
            # Dynamically inject the topic into the invoke/message call
            if 'llm.invoke("Tell me a joke")' in source:
                source = source.replace('llm.invoke("Tell me a joke")', f'llm.invoke("Tell me a joke about {topic}")')
            elif "llm.invoke('Tell me a joke')" in source:
                source = source.replace("llm.invoke('Tell me a joke')", f"llm.invoke('Tell me a joke about {topic}')")
            elif '"Tell me a joke"' in source:
                source = source.replace('"Tell me a joke"', f'"Tell me a joke about {topic}"')
            elif "'Tell me a joke'" in source:
                source = source.replace("'Tell me a joke'", f"'Tell me a joke about {topic}'")
            elif 'llm.invoke(' in source:
                # Fallback if invoke is written differently but is an LLM invoke
                pass
            code_lines.append(source)
            
    full_code = "\n".join(code_lines)
    
    # Execute the extracted Python code using exec and capture output
    import io
    from contextlib import redirect_stdout
    
    output_capture = io.StringIO()
    
    # We must ensure that the working directory inside python execution is correct
    # and env variables are loaded properly.
    # The cell 1 has load_dotenv(), but if it runs in a subprocess, it will read .env relative to Cwd.
    
    with redirect_stdout(output_capture):
        try:
            # We pass a clean global dict, but keep modules importable
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
