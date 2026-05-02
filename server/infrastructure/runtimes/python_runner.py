import sys
import subprocess
import ast
import os

def install_missing_modules(code):
    try:
        tree = ast.parse(code)
    except Exception as e:
        print(f"Error parsing code: {e}", file=sys.stderr)
        return

    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for n in node.names:
                imports.add(n.name.split('.')[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split('.')[0])

    for module in imports:
        try:
            __import__(module)
        except ImportError:
            print(f"Installing missing module: {module}...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", module])
            except subprocess.CalledProcessError as e:
                print(f"Failed to install {module}: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: runner.py <code_file>")
        sys.exit(1)

    code_file = sys.argv[1]
    if not os.path.exists(code_file):
        print(f"Error: {code_file} not found", file=sys.stderr)
        sys.exit(1)

    with open(code_file, 'r') as f:
        code = f.read()

    install_missing_modules(code)

    # Execute the code
    result = subprocess.run([sys.executable, code_file])
    sys.exit(result.returncode)
