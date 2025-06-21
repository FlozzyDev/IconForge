import os
import subprocess
import tempfile
from pathlib import Path
from PIL import Image
import numpy as np
from typing import Optional
from dotenv import load_dotenv
from iconforge.core.utils import loading_animation

load_dotenv()


class SVGConverter:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.input_dir = (
            self.project_root / "src" / "iconforge" / "background_remover" / "output"
        )
        self.output_dir = (
            self.project_root / "src" / "iconforge" / "background_remover" / "output"
        )

        potrace_path = os.getenv("POTRACE_PATH")
        if potrace_path:
            self.potrace_path = Path(potrace_path)
        else:
            self.potrace_path = Path("C:/Tools/potrace-1.16.win64/potrace.exe")

        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.settings = self._load_settings()

    def _load_settings(self) -> dict:
        """Load settings from the settings module. A user can change the settings via the menu."""
        try:
            from iconforge.svg_converter.settings import SVGSettings

            settings_manager = SVGSettings()
            return settings_manager.get_settings()
        except Exception as e:
            print(f"Warning: Could not load settings, using defaults: {e}")
            # Default Settings, works well on most tested
            return {
                "threshold": 128,
                "turdsize": 2,
                "alphamax": 1.0,
                "opttolerance": 0.2,
                "longcurve": True,
                "scale": 1.0,
            }

    def run(self):
        """Main processing flow"""
        print("\n=== SVG Converter ===")

        if not self._check_potrace():
            print(
                "Potrace not found. Please ensure it's installed at C:/Tools/potrace-1.16.win64/potrace.exe"
            )
            print("Returning to main menu...")
            return

        # 1: Select image from background remover output -------------------------------------------
        image_path = self._select_image()
        if not image_path:
            print("Returning to main menu...")
            return

        # 2: Process image to SVG ------------------------------------------------------------------
        self._process_to_svg(image_path)

        print("\nReturning to main menu...")

    def _check_potrace(self) -> bool:
        """Check if Potrace is available at the expected location"""
        if not self.potrace_path.exists():
            return False

        try:
            result = subprocess.run(
                [str(self.potrace_path), "--version"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return result.returncode == 0
        except (
            subprocess.TimeoutExpired,
            subprocess.CalledProcessError,
            FileNotFoundError,
        ):
            return False

    def _select_image(self) -> Optional[Path]:
        """Let user select a PNG image from background remover output directory"""
        if not self.input_dir.exists():
            print(f"Input directory not found: {self.input_dir}")
            return None

        png_files = [
            f
            for f in self.input_dir.iterdir()
            if f.is_file() and f.suffix.lower() == ".png"
        ]

        if not png_files:
            print(f"No PNG images found in {self.input_dir}")
            print(
                "Please run Background Remover first to create images for conversion."
            )
            return None

        print(f"\n=== Available Background-Removed Images ===")
        for i, img_file in enumerate(png_files, 1):
            print(f"{i:2d}. {img_file.name}")
        print()

        try:
            choice = int(input("Select an image to convert to SVG (enter number): "))
            if 1 <= choice <= len(png_files):
                selected_image = png_files[choice - 1]
                print(f"Selected image: {selected_image.name}")
                return selected_image
            else:
                print("Invalid selection")
                return None
        except ValueError:
            print("Please enter a valid number")
            return None

    def _process_to_svg(self, image_path: Path):
        """Convert PNG image to SVG using Potrace. Make sure to have Potrace downloaded and added to .env"""
        try:
            print(f"\nConverting {image_path.name} to SVG...")

            # 1: Convert to black & white -------------------------------------------
            loading_animation(1, "Converting to black & white...")
            bw_image = self._convert_to_black_white(image_path)

            # 2: Save temporary bitmap file (Potrace needs this) -------------------------------------------
            with tempfile.NamedTemporaryFile(suffix=".pbm", delete=False) as temp_file:
                temp_bmp_path = temp_file.name
                bw_image.save(temp_bmp_path, "PPM")

            try:
                # 3: Generate SVG using Potrace -------------------------------------------
                loading_animation(1, "Generating vector paths...")
                output_filename = f"{image_path.stem}_vector.svg"
                output_path = self.output_dir / output_filename

                # Run Potrace command using settings -------------------------------------------
                cmd = [
                    str(self.potrace_path),
                    temp_bmp_path,
                    "-s",  # SVG output
                    "--turdsize",
                    str(self.settings["turdsize"]),
                    "--alphamax",
                    str(self.settings["alphamax"]),
                    "--opttolerance",
                    str(self.settings["opttolerance"]),
                    "--scale",
                    str(self.settings["scale"]),
                    "-o",
                    str(output_path),
                ]

                if self.settings["longcurve"]:
                    cmd.append("--longcurve")

                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

                if result.returncode == 0:
                    print(f"Success! Saved to: {output_path}")
                else:
                    print(f"Error during vectorization: {result.stderr}")
                    return

            finally:
                if os.path.exists(temp_bmp_path):
                    os.unlink(temp_bmp_path)  # Clean up temporary file

        except Exception as e:
            print(f"Error during conversion: {e}")
            print("Please ensure the image is suitable for vectorization.")

    def _convert_to_black_white(self, image_path: Path) -> Image.Image:
        """Convert PNG image to black and white bitmap for Potrace using its alpha channel."""
        # Load image with transparency, images should already have background removed
        image = Image.open(image_path)

        # Convert to RGBA if not already to ensure it has an alpha channel
        if image.mode != "RGBA":
            image = image.convert("RGBA")

        # Get the alpha channel
        alpha = image.getchannel("A")
        threshold = self.settings["threshold"]

        # Create a numpy array from the alpha channel
        alpha_array = np.array(alpha)

        # Where alpha is above the threshold, we want black (0).
        # This creates a black silhouette on a white background.
        bw_array = np.where(alpha_array > threshold, 0, 255)

        # Convert back to a PIL Image in grayscale ('L') mode
        bw_image = Image.fromarray(bw_array.astype(np.uint8), "L")

        return bw_image
