# IconForge Overview

IconForge is a Python-based application for removing backgrounds from images and converting images into SVG format. Once an image is added to the input images folder, it's background can be removed using 1 of 19 different models, at which point it can be converted into an SVG. Color support and multi-layer outputs are still being developed. Keep in mind that in this current version, SVG conversion is for logos and non-complex images. If applied to a complex image, it will simply make a silhouette of the image without details.

## Current Features

- Background Removal: Choose between multiple state-of-the-art models from `rembg` and `InSPyReNet` to remove image backgrounds.
- SVG Conversion: Convert background-removed images into clean (black-white), scalable SVG files.
- Customizable Settings: Tweak SVG conversion parameters to get the desired output.

Currently the background remover works with any image, but the SVG converter will only make clean silhouettes of images, thus it really only works with basic Icons. Full color and multi-layer support are still being worked on and will be updated at a later date.

## Purpose

The purpose of IconForge was to create a simple application that allowed a user to take images found or generated via AI, and be able to remove it's background as well as manipulate it inside design software such as figma. This purpose was born from my own annoyance at having to open photoshop anytime I wanted to remove a simple background, as well as being disappointed with most free online options. My own process of converting images to SVGs is also very painful, which involves me making X copies of a traced image where X is the number of colors the image has. I then delete portions of each SVG (keeping that specific color) and then layer them back into one image. It's a very tedious process that I wanted to automate.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Python: Version 3.8 or higher.
- Git: For cloning the repository.
- NVIDIA GPU & CUDA (Recommended)\*\*: For significant performance improvement in background removal, an NVIDIA GPU with the CUDA Toolkit installed is highly recommended. The application will fall back to CPU if a GPU is not available, which will be much slower and in my experience it fails often.
- Potrace: This tool is required for converting bitmap images to SVG.
- Storage: The application will download language models to cache locally, so you will need at least 10GB of space available if you want all models.

# Development Environment

For this program I used Visual Studio Code along with extensions such as Block Formatter, Python, and Python Debugger. I used a virtual environment to keep my dependancies separate. This application was created in Python 3.13.5.

I would like to note that IconForge stands on the shoulders of other developers, and heavily relies on 3 open-source applications. I am very grateful for them and their incredible documentation.

1. [Background Remover](https://github.com/nadermx/backgroundremover)
2. [Transparent Background](https://github.com/plemeri/transparent-background)
3. [Potrace](https://potrace.sourceforge.net/)

In addition to these 3 main libraries, IconForge uses:
"numpy==2.2.6"
"onnxruntime-gpu==1.22.0"
"opencv-python==4.11.0.86"
"pillow==11.2.1"
"protobuf==6.31.1"
"python-dotenv==1.0.1"
"rembg==2.0.66"
"requests==2.32.4"
"safetensors==0.5.3"
"scikit-image==0.25.2"
"torch==2.7.1+cu128"
"torchvision==0.22.1+cu128"
"tqdm==4.67.1"
"transparent-background==1.3.4"
"typing_extensions==4.12.2"
"urllib3==2.4.0"

# Setup and Installation

Follow these steps to get your local development environment set up.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IconForge
```

### 2. Set up Potrace

You need to download Potrace and make it accessible to the application.

- **Windows**:

  1.  Download the latest Potrace binaries from the [official website](http://potrace.sourceforge.net/).
  2.  Extract the contents to a folder, for example, `C:\Tools\potrace-1.16.win64`.
  3.  The application will look for `potrace.exe` in `C:\Tools\potrace-1.16.win64` by default. If you place it elsewhere, you must set an environment variable (see below).

- **macOS/Linux**: Install using a package manager.

  ```bash
  # On macOS with Homebrew
  brew install potrace

  # On Debian/Ubuntu
  sudo apt-get install potrace
  ```

### 3. Create a Virtual Environment

```bash
# Create the virtual environment
python -m venv venv

# Activate it
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 4. Install Dependencies

Install the required Python packages using pip. The `-e .` command installs the project in "editable" mode.

```bash
pip install -e .
```

### 5. Download AI Models (Automatic)

The AI models for background removal are downloaded **automatically** the first time you select them in the application menu. When you run a model for the first time, please be patient as it may take a few minutes to download.

The models will be cached in your user home directory (e.g., `~/.cache/`) for future use.

Keep in mind this takes up approximately 8GB of memory. You can remove models you do not want from the code before running if you don't want them all. The 2 I recommend keeping would be bria-rmbg and birefnet-general which seem to work the best for most general icons and images.

### 6. Configure Environment Variables

If you installed Potrace in a custom location, you need to tell the application where to find it. Create a `.env` file in the root of the `IconForge` project directory:

**.env file**

```
POTRACE_PATH="C:/path/to/your/potrace.exe"
```

## How to Run

1.  Make sure your virtual environment is activated.
2.  Place any images you want to process into the `assets/input_images/` directory.
3.  Run the main application from the root directory:

    ```bash
    python -m src.iconforge.main
    ```

4.  Follow the interactive command-line menus to select an operation (Background Remover or SVG Converter), choose your models, and process your images.

# Useful Websites

This is a general list of resources that I found useful while building IconForge.

- [Youtube - SVG Guide](https://www.youtube.com/watch?v=hZYaSGUbMds&t=481s)
- [Nvidia CUDA Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html)
- [Potrace Info](https://potrace.sourceforge.net/#usage)
- [Pillow Docs](https://pillow.readthedocs.io/en/stable/)
- [Numpy Docs](https://numpy.org/doc/stable/reference/)
- [Background Remover](https://github.com/nadermx/backgroundremover)
- [Transparent Background](https://github.com/plemeri/transparent-background)

# Future Work

- I am currently developing color output support as well as having multiple layers. That way SVG files will contain the original colors and be easier to edit and manipulate. The current method being explored is clustering colors together before creating X SVGs where X is the number of clustered colors. Once all SVGs are created, we want to merge them into one SVG file (while keeping groups separate for easiler editing).
- Combining the application into a single pipeline that can be run on multiple images with 1 command.
- Adding a simple GUI so users don't need to use the CLI. A more powerful GUI would allow users to see real-time clustering which would allow changes to be made prior to the SVG being generated, but that has not been explored at this time.
