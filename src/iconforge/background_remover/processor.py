import os
import io
import warnings
from pathlib import Path
from PIL import Image
import rembg
import numpy as np
import rembg.sessions
from transparent_background import Remover
from typing import Optional
from iconforge.core.utils import loading_animation

warnings.filterwarnings("ignore", category=UserWarning, module="torch")
warnings.filterwarnings("ignore", category=UserWarning, module="transparent_background")
warnings.filterwarnings("ignore", category=RuntimeWarning, module="transparent_background")

class BackgroundProcessor:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.input_dir = self.project_root / "assets" / "input_images"
        self.output_dir = self.project_root / "src" / "iconforge" / "background_remover" / "output"

        self.output_dir.mkdir(parents=True, exist_ok=True)

    def run(self):
        """Main processing flow"""
        print("\n=== Background Remover ===")

        # 1: Select model type -------------------------------------------
        model_choice = self._select_model_type()
        if not model_choice:
            print("Returning to main menu...")
            return

        # 2: Select image -------------------------------------------
        image_path = self._select_image()
        if not image_path:
            print("Returning to main menu...")
            return

        # 3: Process based on type -------------------------------------------
        if model_choice == "rembg":
            self._process_with_rembg(image_path)
        else:  # transparent-background
            self._process_with_inspyrenet(image_path)
        
        print("\nReturning to main menu...")

    def _select_model_type(self) -> Optional[str]:
        """Let user choose between rembg models or InSPyReNet. 2 different applications with several models. I personally find REMBG model bria-rmbg works great"""
        print("\n=== Model Categories ===")
        print("1. rembg models (multiple options)")
        print("2. InSPyReNet (high quality)")
        print()

        try:
            choice = int(input("Select model category (1 or 2): "))
            if choice == 1:
                return "rembg"
            elif choice == 2:
                return "inspyrenet"
            else:
                print("Invalid selection")
                return None
        except ValueError:
            print("Please enter 1 or 2")
            return None

    def _select_image(self) -> Optional[Path]:
        """Let user select an image from input directory"""
        if not self.input_dir.exists():
            print(f"Input directory not found: {self.input_dir}")
            return None

        # Get all image files
        image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        image_files = [
            f
            for f in self.input_dir.iterdir()
            if f.is_file() and f.suffix.lower() in image_extensions
        ]

        if not image_files:
            print(f"No images found in {self.input_dir}")
            return None

        # Image menu
        print(f"\n=== Available Images ===")
        for i, img_file in enumerate(image_files, 1):
            print(f"{i:2d}. {img_file.name}")
        print()

        # Get user selection
        try:
            choice = int(input("Select an image (enter number): "))
            if 1 <= choice <= len(image_files):
                selected_image = image_files[choice - 1]
                print(f"Selected image: {selected_image.name}")
                return selected_image
            else:
                print("Invalid selection")
                return None
        except ValueError:
            print("Please enter a valid number")
            return None

    def _process_with_rembg(self, image_path: Path):
        """Process image using rembg models"""
        
        # Only show models that are available in rembg
        available_models = rembg.sessions.sessions_names
        
        model_descriptions = {
            "u2net": "General purpose - good balance",
            "u2netp": "Lighter/faster version of u2net", 
            "u2net_human_seg": "Optimized for people",
            "silueta": "Lightweight and very fast",
            "bria-rmbg": "Commercial-grade quality",
            "birefnet-general": "High-quality general purpose",
            "birefnet-portrait": "Specialized for portraits", 
            "sam": "Segment Anything Model - complex scenes",
            "isnet-general-use": "General purpose alternative",
            "u2net_cloth_seg": "Clothing/fashion segmentation",
            "birefnet-general-lite": "Lighter version of BiRefNet general",
            "birefnet-hrsod": "High-resolution salient object detection",
            "birefnet-dis": "Dichotomous image segmentation",
            "birefnet-cod": "Camouflaged object detection",
            "isnet-anime": "Specialized for anime/cartoon characters"
        }

        print("\n=== Available rembg Models (Local Only) ===")
        for i, model in enumerate(available_models, 1):
            desc = model_descriptions.get(model, "No description available")
            print(f"{i:2d}. {model:<25} {desc}")
        print()

        # Get model selection
        try:
            choice = int(input("Select rembg model: "))
            if 1 <= choice <= len(available_models):
                selected_model = available_models[choice - 1]
                print(f"✅ Using model: {selected_model}")
            else:
                print("Invalid selection")
                return
        except ValueError:
            print("Please enter a valid number")
            return

        # Process image - Must be locally installed
        try:
            print(f"\nProcessing with rembg...")

            input_image = Image.open(image_path)
            loading_animation(1, f"Loading {selected_model} model...")
            
            session = rembg.new_session(selected_model)
            
            loading_animation(1, "Processing image...")
            result = rembg.remove(input_image, session=session)

            if isinstance(result, Image.Image):
                output_image = result
            else:
                output_image = (
                    Image.fromarray(result)
                    if isinstance(result, np.ndarray)
                    else Image.open(io.BytesIO(result))
                )

            output_filename = f"{image_path.stem}_rembg_{selected_model}.png"
            output_path = self.output_dir / output_filename
            output_image.save(output_path)

            print(f"Success! Saved to: {output_path}")

        except Exception as e:
            print(f"Error: Model not available locally. {e}")
            print("Choose a different model or download this model first.")

    def _process_with_inspyrenet(self, image_path: Path):
        """Process image using InSPyReNet (transparent-background) - locally installed"""
        print("\n=== InSPyReNet Options ===")
        print("1. Base mode (highest quality)")
        print("2. Fast mode (good quality, faster)")
        print()

        try:
            choice = int(input("Select mode (1 or 2): "))
            if choice == 1:
                mode = "base"
            elif choice == 2:
                mode = "fast"
            else:
                print("Invalid selection")
                return
        except ValueError:
            print("Please enter 1 or 2")
            return

        # Process image - locally installed
        try:
            print(f"\nProcessing with InSPyReNet ({mode} mode)...")

            # Convert image to RGB and then to numpy array
            input_image = Image.open(image_path).convert('RGB')
            input_array = np.array(input_image)
            
            # Start loading animation
            loading_animation(1, f"Loading InSPyReNet ({mode} mode)...")
            
            remover = Remover(mode=mode, jit=True)
            
            # Continue loading animation while processing
            loading_animation(1, "Processing image...")
            output_array = remover.process(input_array, type="rgba")
            output_image = Image.fromarray(output_array)

            # Save result
            output_filename = f"{image_path.stem}_inspyrenet_{mode}.png"
            output_path = self.output_dir / output_filename
            output_image.save(output_path)

            print(f"Success! Saved to: {output_path}")

        except Exception as e:
            print(f"Error: Model not available locally. {e}")
            print("Model may need to be downloaded first.")