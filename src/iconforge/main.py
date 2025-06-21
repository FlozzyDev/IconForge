import onnxruntime as ort
import warnings
from iconforge.core.utils import loading_animation

warnings.filterwarnings("ignore", category=UserWarning, module="torch")
warnings.filterwarnings("ignore", category=UserWarning, module="transparent_background")
warnings.filterwarnings(
    "ignore", category=RuntimeWarning, module="transparent_background"
)
warnings.filterwarnings("ignore", message="Failed to import flet.*")


def main():
    ort.preload_dlls()

    while True:
        # Main menu
        print("\n=== IconForge Image Processor ===")
        print("1. Background Remover")
        print("2. SVG Converter")
        print("3. SVG Converter Settings")
        print("4. Exit")

        menu_choice = input("\nSelect an option: ")

        if menu_choice == "1":
            print("\nLoading Background Remover...")
            loading_animation(1, "Initializing...")
            from iconforge.background_remover.processor import BackgroundProcessor

            loading_animation(1, "Loading models...")
            processor = BackgroundProcessor()
            processor.run()
        elif menu_choice == "2":
            print("\nLoading SVG Converter...")
            loading_animation(1, "Initializing...")
            from iconforge.svg_converter.processor import SVGConverter

            loading_animation(1, "Loading components...")
            converter = SVGConverter()
            converter.run()
        elif menu_choice == "3":
            print("\nLoading SVG Converter Settings...")
            loading_animation(1, "Initializing...")
            from iconforge.svg_converter.settings import SVGSettings

            loading_animation(1, "Loading settings...")
            settings = SVGSettings()
            settings.run()
        elif menu_choice == "4":
            print("Application Closing")
            break
        else:
            print("Please try again.")


if __name__ == "__main__":
    main()
