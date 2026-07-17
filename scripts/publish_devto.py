import os
import re
import json
import urllib.request
import urllib.error

# Config
ENV_FILE = ".env"
POSTS_DIR = "case-studies"

def load_api_key():
    """Load API Key from environment or .env file."""
    # 1. Check environment variables
    api_key = os.environ.get("DEVTO_API_KEY")
    if api_key:
        return api_key
    
    # 2. Check local .env file
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("DEVTO_API_KEY="):
                    return line.strip().split("DEVTO_API_KEY=")[1].strip().strip('"').strip("'")
    return None

def parse_markdown(file_path):
    """Parse markdown file and extract frontmatter + content."""
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    
    # Regex to split frontmatter
    # Matches starting --- and ending ---
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    
    frontmatter = {}
    content = text
    
    if match:
        yaml_block = match.group(1)
        content = match.group(2)
        
        # Simple YAML parser
        for line in yaml_block.split("\n"):
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                
                # Parse list tags like [seo, webdev] or comma-separated strings
                if key == "tags":
                    if val.startswith("[") and val.endswith("]"):
                        tags = [t.strip().strip('"').strip("'") for t in val[1:-1].split(",")]
                    else:
                        tags = [t.strip() for t in val.split(",")]
                    frontmatter[key] = tags
                # Parse boolean published
                elif key == "published":
                    frontmatter[key] = val.lower() == "true"
                else:
                    frontmatter[key] = val
                    
    return frontmatter, content

def publish_to_devto(api_key, title, body_markdown, tags=None, published=False):
    """Post article to Dev.to API."""
    url = "https://dev.to/api/articles"
    
    payload = {
        "article": {
            "title": title,
            "published": published,
            "body_markdown": body_markdown
        }
    }
    
    if tags:
        payload["article"]["tags"] = tags[:4] # Dev.to supports max 4 tags
        
    req_data = json.dumps(payload).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "api-key": api_key,
            "User-Agent": "AmanPortfolioPublisher/1.0"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            return True, data
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            err_data = json.loads(err_msg)
            return False, err_data.get("error", err_msg)
        except Exception:
            return False, err_msg
    except Exception as e:
        return False, str(e)

def main():
    print("=== DEV.TO PORTFOLIO CASE STUDY PUBLISHER ===")
    
    if not os.path.exists(POSTS_DIR):
        print(f"\nNo '{POSTS_DIR}' directory found. Creating directory...")
        os.makedirs(POSTS_DIR)
        
        # Create a sample markdown template
        sample_path = os.path.join(POSTS_DIR, "siddharth_opticals_redesign.md")
        sample_content = """---
title: How I Redesigned Siddharth Opticals for Premium Brand Growth
description: A complete UX and engineering breakdown of our high-end luxury eyewear website overhaul.
tags: [webdev, seo, UX, marketing]
published: false
---

# Case Study: Redesigning a Premium Eyewear Store

We recently executed a complete visual and structural overhaul for **Siddharth Opticals** (established in 1982 by Mr. Lalit Nanda, AIIMS-trained optometrist). 

## Core Focus Areas:
1. **Premium Aesthetic**: Implemented a champagne-gold and dark charcoal color system.
2. **Clinical Authority**: Highlighted Mr. Lalit Nanda's 40+ years of trusted clinical optometry.
3. **Conversion Engineering**: Integrated SQLite-backed appointment requests and a direct WhatsApp booking triage link.

Read more or see my full portfolio at [Aman Kumar Portfolio](https://yeahitsmeaman.netlify.app/).
"""
        with open(sample_path, "w", encoding="utf-8") as f:
            f.write(sample_content)
        print(f"Created a sample case study template at: {sample_path}")
        print("Please edit this file and run the script again to publish!")
        return

    api_key = load_api_key()
    if not api_key:
        print("\nERROR: DEVTO_API_KEY not found!")
        print("Please create a file named '.env' in your root directory and add:")
        print("DEVTO_API_KEY=your_dev_to_api_token_here")
        print("\nYou can generate a token at: https://dev.to/settings/extensions")
        return

    # List markdown files
    files = [f for f in os.listdir(POSTS_DIR) if f.endswith(".md")]
    if not files:
        print(f"\nNo markdown (.md) case studies found in '{POSTS_DIR}/' folder.")
        print("Please place your articles there.")
        return
    
    print(f"\nFound {len(files)} article(s) in '{POSTS_DIR}/':")
    for idx, f in enumerate(files):
        print(f"[{idx + 1}] {f}")
        
    choice_idx = input("\nEnter the number of the article you want to publish: ")
    try:
        choice_idx = int(choice_idx) - 1
        if choice_idx < 0 or choice_idx >= len(files):
            print("Invalid selection.")
            return
    except ValueError:
        print("Invalid selection.")
        return
        
    target_file = os.path.join(POSTS_DIR, files[choice_idx])
    print(f"\nParsing: {target_file}...")
    
    frontmatter, content = parse_markdown(target_file)
    
    title = frontmatter.get("title")
    if not title:
        print("ERROR: Article 'title' is missing from the markdown frontmatter metadata block.")
        return
        
    tags = frontmatter.get("tags", [])
    published = frontmatter.get("published", False)
    
    print("\nPublishing Details:")
    print(f"  - Title: {title}")
    print(f"  - Tags: {', '.join(tags) if tags else 'None'}")
    print(f"  - Publish Live: {published} (if 'false', it will be uploaded as a Draft)")
    
    confirm = input("\nDo you want to upload this to Dev.to? (y/n): ").lower()
    if confirm != 'y':
        print("Aborted.")
        return
        
    print("\nUploading to Dev.to API...")
    success, result = publish_to_devto(api_key, title, content, tags, published)
    
    if success:
        print("\nSUCCESS! Article uploaded successfully.")
        print(f"  - Title: {result.get('title')}")
        print(f"  - URL: {result.get('url')}")
        print(f"  - Status: {'LIVE' if result.get('published') else 'DRAFT'}")
    else:
        print(f"\nUPLOAD FAILED: {result}")

if __name__ == "__main__":
    main()
