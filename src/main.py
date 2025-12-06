import argparse
import os
import sys
from dotenv import load_dotenv
from src.database import init_db
from src.generator import ContentGenerator
from src.scheduler import BotScheduler

# Load environment variables
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description='LinkedIn Automation Bot')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Generate command
    gen_parser = subparsers.add_parser('generate', help='Generate content')
    gen_parser.add_argument('--days', type=int, default=7, help='Number of days to generate content for')
    gen_parser.add_argument('--context', type=str, default='context.txt', help='Path to context file')

    # Run Scheduler command
    run_parser = subparsers.add_parser('run', help='Run the scheduler bot')

    args = parser.parse_args()

    # Initialize DB
    db_url = os.getenv('DATABASE_URL', 'sqlite:///data/posts.db')
    Session = init_db(db_url)
    session = Session()

    if args.command == 'generate':
        print(f"Generating content for {args.days} days...")
        generator = ContentGenerator(session)
        generator.generate_bulk(days=args.days, context_file=args.context)
        print("Generation complete.")

    elif args.command == 'run':
        print("Starting Scheduler Bot...")
        scheduler = BotScheduler(session)
        scheduler.start()

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
