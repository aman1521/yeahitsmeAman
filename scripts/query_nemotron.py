#!/usr/bin/env python
import os
import sys
import argparse
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

class NemotronClient:
    """
    A client wrapper to interface with NVIDIA Nemotron-3-Ultra (or other Nemotron models)
    using OpenAI-compatible APIs (OpenRouter, NVIDIA API Catalog, or local NIMs).
    """
    def __init__(self, api_key=None, base_url=None, default_model=None):
        self.api_key = api_key or os.getenv("NEMOTRON_API_KEY")
        self.base_url = base_url or os.getenv("NEMOTRON_BASE_URL", "https://openrouter.ai/api/v1")
        self.model = default_model or os.getenv("NEMOTRON_MODEL", "nvidia/nemotron-3-ultra-550b-a55b")

        if not self.api_key or self.api_key == "your_api_key_here":
            raise ValueError(
                "API Key is missing or set to placeholder. Please configure your actual "
                "API key in NEMOTRON_API_KEY in your local .env file."
            )

        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    def query(self, prompt, system_prompt=None, temperature=0.7, stream=True):
        """
        Sends a prompt to the Nemotron model and returns the response.
        Supports streaming for real-time text generation.
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                stream=stream
            )
            return response
        except Exception as e:
            print(f"Error querying Nemotron API: {e}", file=sys.stderr)
            raise

def main():
    parser = argparse.ArgumentParser(description="Query the NVIDIA Nemotron-3-Ultra model via API.")
    parser.add_argument("prompt", type=str, nargs="?", help="The prompt to send to the model.")
    parser.add_argument("--system", type=str, default="You are a helpful AI assistant.", help="Optional system instruction.")
    parser.add_argument("--temp", type=float, default=0.7, help="Temperature setting (default: 0.7).")
    parser.add_argument("--no-stream", action="store_true", help="Disable response streaming.")
    args = parser.parse_args()

    # If no prompt is provided as argument, enter interactive loop
    if not args.prompt:
        print("--- Nemotron-3-Ultra Interactive CLI ---")
        print("Type 'exit' or 'quit' to end the session.\n")
        
        try:
            client = NemotronClient()
        except ValueError as e:
            print(f"\n[Configuration Error]: {e}\n")
            print("Please configure your .env file with the following variables:")
            print("NEMOTRON_API_KEY=your_api_key_here")
            print("NEMOTRON_BASE_URL=https://openrouter.ai/api/v1 (or https://integrate.api.nvidia.com/v1)")
            print("NEMOTRON_MODEL=nvidia/nemotron-3-ultra-550b-a55b\n")
            sys.exit(1)

        while True:
            try:
                user_input = input("\nYou: ").strip()
                if not user_input:
                    continue
                if user_input.lower() in ["exit", "quit"]:
                    break
                
                print("Nemotron: ", end="", flush=True)
                response = client.query(
                    prompt=user_input,
                    system_prompt=args.system,
                    temperature=args.temp,
                    stream=True
                )
                for chunk in response:
                    content = chunk.choices[0].delta.content
                    if content:
                        print(content, end="", flush=True)
                print()
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"\nAn error occurred: {e}")
    else:
        # Single prompt command-line invocation
        try:
            client = NemotronClient()
            response = client.query(
                prompt=args.prompt,
                system_prompt=args.system,
                temperature=args.temp,
                stream=not args.no_stream
            )

            if args.no_stream:
                print(response.choices[0].message.content)
            else:
                for chunk in response:
                    content = chunk.choices[0].delta.content
                    if content:
                        print(content, end="", flush=True)
                print()
        except ValueError as e:
            print(f"[Configuration Error]: {e}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            sys.exit(1)

if __name__ == "__main__":
    main()
