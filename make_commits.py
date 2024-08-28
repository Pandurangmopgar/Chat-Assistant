import os
import subprocess

def run_command(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    output, error = process.communicate()
    return output.decode('utf-8'), error.decode('utf-8')

def git_add(files):
    return run_command(f"git add {' '.join(files)}")

def git_commit(message):
    return run_command(f'git commit -m "{message}"')

# Define sections and their corresponding files
sections = {
    "Project Setup": [".gitignore", "README.md", "package.json", "package-lock.json", "vite.config.js", "eslint.config.js"],
    "Core Application": ["src/App.jsx", "src/App.css", "src/main.jsx", "src/index.css", "index.html"],
    "Components": ["src/components/Main/Main.css", "src/components/Main/Mainn.jsx", "src/components/Sidebar/Sidebar.css", "src/components/Sidebar/Sidebar.jsx"],
    "Context": ["Context.jsx"],
    "Configuration": ["src/config/app.py", "src/config/gemini.js", "src/config/populateDatabase.js", "src/config/vectorDbConfig.js"],
    "Miscellaneous": ["make_commits.py", "public/vite.svg", "src/context/commit_plan.txt"]
}

# Commit each section
for section, files in sections.items():
    print(f"Committing {section}...")
    output, error = git_add(files)
    if error:
        print(f"Error adding files for {section}: {error}")
        continue
    
    output, error = git_commit(f"Add {section}")
    if error:
        print(f"Error committing {section}: {error}")
    else:
        print(f"Successfully committed {section}")
    print("------------------------")

print("All sections committed!")