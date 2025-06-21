import json
import os
from pathlib import Path
from typing import Dict, Any
from iconforge.core.utils import loading_animation

class SVGSettings:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.settings_file = self.project_root / "svg_settings.json"
        
        # Default settings
        self.default_settings = {
            "threshold": {
                "value": 128,
                "description": "Controls how dark a pixel needs to be to become black (0-255). Lower = bolder, Higher = lighter",
                "range": [0, 255]
            },
            "turdsize": {
                "value": 2,
                "description": "Minimum area (in pixels) for a path to be included. Higher = removes small details",
                "range": [0, 100]
            },
            "alphamax": {
                "value": 1.0,
                "description": "Corner threshold for curve smoothing. Lower = sharper corners, Higher = smoother curves",
                "range": [0.0, 2.0]
            },
            "opttolerance": {
                "value": 0.2,
                "description": "Curve optimization tolerance. Lower = more precise curves, Higher = simpler curves",
                "range": [0.0, 1.0]
            },
            "longcurve": {
                "value": True,
                "description": "Enable long curve optimization for smoother paths",
                "type": "boolean"
            },
            "scale": {
                "value": 1.0,
                "description": "Scaling factor for the output SVG. 1.0 = original size",
                "range": [0.1, 10.0]
            }
        }
        
        # Load current settings from file
        self.current_settings = self._load_settings()

    def run(self):
        """Main settings menu"""
        print("\n=== SVG Converter Settings ===")
        
        while True:
            print("\nCurrent Settings:")
            self._display_current_settings()
            
            print("\nOptions:")
            print("1. Change Threshold (Boldness/Lightness)")
            print("2. Change Detail Level (Remove Small Details)")
            print("3. Change Corner Smoothing")
            print("4. Change Curve Precision")
            print("5. Toggle Long Curve Optimization")
            print("6. Change Output Scale")
            print("7. Reset to Defaults")
            print("8. Return to Main Menu")
            
            choice = input("\nSelect an option: ")
            
            if choice == "1":
                self._change_threshold()
            elif choice == "2":
                self._change_turdsize()
            elif choice == "3":
                self._change_alphamax()
            elif choice == "4":
                self._change_opttolerance()
            elif choice == "5":
                self._toggle_longcurve()
            elif choice == "6":
                self._change_scale()
            elif choice == "7":
                self._reset_to_defaults()
            elif choice == "8":
                print("Returning to main menu...")
                break
            else:
                print("Invalid choice. Please try again.")

    def _load_settings(self) -> Dict[str, Any]:
        """Load settings from file or use defaults"""
        if self.settings_file.exists():
            try:
                with open(self.settings_file, 'r') as f:
                    saved_settings = json.load(f)
                    # Merge with defaults to ensure all settings exist
                    settings = self.default_settings.copy()
                    for key, value in saved_settings.items():
                        if key in settings:
                            settings[key]["value"] = value["value"]
                    return settings
            except Exception as e:
                print(f"Error loading settings: {e}")
                return self.default_settings.copy()
        else:
            return self.default_settings.copy()

    def _save_settings(self):
        """Save current settings to file"""
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(self.current_settings, f, indent=2)
            print("Settings saved successfully!")
        except Exception as e:
            print(f"Error saving settings: {e}")

    def _display_current_settings(self):
        """Display current settings in a readable format"""
        for key, setting in self.current_settings.items():
            value = setting["value"]
            if setting.get("type") == "boolean":
                value = "Enabled" if value else "Disabled"
            print(f"  {key.replace('_', ' ').title()}: {value}")

    def _change_threshold(self):
        """Change the threshold setting, it controls how dark a pixel needs to be to become black (0-255). Lower = bolder, Higher = lighter"""
        setting = self.current_settings["threshold"]
        current = setting["value"]
        min_val, max_val = setting["range"]
        
        print(f"\n=== Threshold Setting ===")
        print(f"Current value: {current}")
        print(f"Description: {setting['description']}")
        print(f"Range: {min_val} - {max_val}")
        print(f"  Lower values = Bolder (more black)")
        print(f"  Higher values = Lighter (more white)")
        
        try:
            new_value = int(input(f"Enter new threshold ({min_val}-{max_val}): "))
            if min_val <= new_value <= max_val:
                self.current_settings["threshold"]["value"] = new_value
                self._save_settings()
                print(f"Threshold updated to {new_value}")
            else:
                print(f"Value must be between {min_val} and {max_val}")
        except ValueError:
            print("Please enter a valid number")

    def _change_turdsize(self):
        """Change the turdsize setting, it controls the minimum area (in pixels) for a path to be included. Higher = removes small details"""
        setting = self.current_settings["turdsize"]
        current = setting["value"]
        min_val, max_val = setting["range"]
        
        print(f"\n=== Detail Level Setting ===")
        print(f"Current value: {current}")
        print(f"Description: {setting['description']}")
        print(f"Range: {min_val} - {max_val}")
        print(f"  Lower values = Keep more small details")
        print(f"  Higher values = Remove small details")
        
        try:
            new_value = int(input(f"Enter new detail level ({min_val}-{max_val}): "))
            if min_val <= new_value <= max_val:
                self.current_settings["turdsize"]["value"] = new_value
                self._save_settings()
                print(f"Detail level updated to {new_value}")
            else:
                print(f"Value must be between {min_val} and {max_val}")
        except ValueError:
            print("Please enter a valid number")

    def _change_alphamax(self):
        """Change the alphamax setting, it controls the corner threshold for curve smoothing. Lower = sharper corners, Higher = smoother curves"""
        setting = self.current_settings["alphamax"]
        current = setting["value"]
        min_val, max_val = setting["range"]
        
        print(f"\n=== Corner Smoothing Setting ===")
        print(f"Current value: {current}")
        print(f"Description: {setting['description']}")
        print(f"Range: {min_val} - {max_val}")
        print(f"  Lower values = Sharper corners")
        print(f"  Higher values = Smoother curves")
        
        try:
            new_value = float(input(f"Enter new corner smoothing ({min_val}-{max_val}): "))
            if min_val <= new_value <= max_val:
                self.current_settings["alphamax"]["value"] = new_value
                self._save_settings()
                print(f"Corner smoothing updated to {new_value}")
            else:
                print(f"Value must be between {min_val} and {max_val}")
        except ValueError:
            print("Please enter a valid number")

    def _change_opttolerance(self):
        """Change the opttolerance setting, it controls the curve optimization tolerance. Lower = more precise curves, Higher = simpler curves"""
        setting = self.current_settings["opttolerance"]
        current = setting["value"]
        min_val, max_val = setting["range"]
        
        print(f"\n=== Curve Precision Setting ===")
        print(f"Current value: {current}")
        print(f"Description: {setting['description']}")
        print(f"Range: {min_val} - {max_val}")
        print(f"  Lower values = More precise curves")
        print(f"  Higher values = Simpler curves")
        
        try:
            new_value = float(input(f"Enter new curve precision ({min_val}-{max_val}): "))
            if min_val <= new_value <= max_val:
                self.current_settings["opttolerance"]["value"] = new_value
                self._save_settings()
                print(f"Curve precision updated to {new_value}")
            else:
                print(f"Value must be between {min_val} and {max_val}")
        except ValueError:
            print("Please enter a valid number")

    def _toggle_longcurve(self):
        """Toggle the longcurve setting, it controls the long curve optimization for smoother paths. Enabled = smoother, Disabled = faster processing"""
        setting = self.current_settings["longcurve"]
        current = setting["value"]
        
        print(f"\n=== Long Curve Optimization ===")
        print(f"Current value: {'Enabled' if current else 'Disabled'}")
        print(f"Description: {setting['description']}")
        print(f"  Enabled = Smoother, more optimized curves")
        print(f"  Disabled = Faster processing, less optimization")
        
        toggle = input("Toggle long curve optimization? (y/n): ").lower()
        if toggle in ['y', 'yes']:
            self.current_settings["longcurve"]["value"] = not current
            self._save_settings()
            status = "Enabled" if not current else "Disabled"
            print(f"Long curve optimization {status}")
        else:
            print("Setting unchanged")

    def _change_scale(self):
        """Change the scale setting, it controls the output scale. 1.0 = original size, < 1.0 = smaller output, > 1.0 = larger output"""
        setting = self.current_settings["scale"]
        current = setting["value"]
        min_val, max_val = setting["range"]
        
        print(f"\n=== Output Scale Setting ===")
        print(f"Current value: {current}")
        print(f"Description: {setting['description']}")
        print(f"Range: {min_val} - {max_val}")
        print(f"  1.0 = Original size")
        print(f"  < 1.0 = Smaller output")
        print(f"  > 1.0 = Larger output")
        
        try:
            new_value = float(input(f"Enter new scale ({min_val}-{max_val}): "))
            if min_val <= new_value <= max_val:
                self.current_settings["scale"]["value"] = new_value
                self._save_settings()
                print(f"Output scale updated to {new_value}")
            else:
                print(f"Value must be between {min_val} and {max_val}")
        except ValueError:
            print("Please enter a valid number")

    def _reset_to_defaults(self):
        """Reset all settings to defaults"""
        print("\n=== Reset to Defaults ===")
        confirm = input("Are you sure you want to reset all settings to defaults? (y/n): ").lower()
        if confirm in ['y', 'yes']:
            self.current_settings = self.default_settings.copy()
            self._save_settings()
            print("All settings reset to defaults")
        else:
            print("Reset cancelled")

    def get_settings(self) -> Dict[str, Any]:
        """Get current settings for use by the SVG Converter"""
        return {key: setting["value"] for key, setting in self.current_settings.items()} 