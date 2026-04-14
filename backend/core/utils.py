import sys
import time
from typing import Optional


def loading_animation(duration: int, message: Optional[str] = None) -> None:
    """
    Display a loading spinner animation for the specified duration.
    """
    spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    start_time = time.time()
    i = 0

    try:
        while time.time() - start_time < duration:
            sys.stdout.write(f'\r{spinner[i]} {message if message else "Loading..."}')
            sys.stdout.flush()
            time.sleep(0.1)
            i = (i + 1) % len(spinner)
    except KeyboardInterrupt:
        pass
    finally:
        display_message = message if message else "Loading..."
        sys.stdout.write(
            "\r" + " " * (len(display_message) + 10) + "\r"
        )  # Clear the line
        sys.stdout.flush()
