from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/svg")
async def get_svg_settings():
    """Get current SVG converter settings."""
    from backend.svg_converter.settings import SVGSettings

    settings = SVGSettings()
    return settings.current_settings


@router.put("/svg")
async def update_svg_settings(updates: dict):
    """Update SVG converter settings (partial update)."""
    from backend.svg_converter.settings import SVGSettings

    settings = SVGSettings()

    for key, value in updates.items():
        if key not in settings.current_settings:
            raise HTTPException(status_code=400, detail=f"Unknown setting: {key}")

        setting = settings.current_settings[key]

        # Validate based on type
        if setting.get("type") == "boolean":
            if not isinstance(value, bool):
                raise HTTPException(
                    status_code=400, detail=f"{key} must be a boolean"
                )
            setting["value"] = value
        elif "range" in setting:
            min_val, max_val = setting["range"]
            if not min_val <= value <= max_val:
                raise HTTPException(
                    status_code=400,
                    detail=f"{key} must be between {min_val} and {max_val}",
                )
            setting["value"] = value

    settings._save_settings()
    return settings.current_settings


@router.get("/color-svg")
async def get_color_svg_settings():
    """Get current Color SVG (vtracer) settings."""
    from backend.color_svg_converter.settings import ColorSVGSettings

    return ColorSVGSettings().current_settings


@router.put("/color-svg")
async def update_color_svg_settings(updates: dict):
    """Update Color SVG (vtracer) settings (partial update)."""
    from backend.color_svg_converter.settings import ColorSVGSettings

    settings = ColorSVGSettings()

    for key, value in updates.items():
        if key not in settings.current_settings:
            raise HTTPException(status_code=400, detail=f"Unknown setting: {key}")

        setting = settings.current_settings[key]
        setting_type = setting.get("type")

        if setting_type == "boolean":
            if not isinstance(value, bool):
                raise HTTPException(status_code=400, detail=f"{key} must be a boolean")
            setting["value"] = value
        elif setting_type == "enum":
            options = setting.get("options", [])
            if value not in options:
                raise HTTPException(
                    status_code=400,
                    detail=f"{key} must be one of {options}",
                )
            setting["value"] = value
        elif "range" in setting:
            min_val, max_val = setting["range"]
            if not min_val <= value <= max_val:
                raise HTTPException(
                    status_code=400,
                    detail=f"{key} must be between {min_val} and {max_val}",
                )
            setting["value"] = value

    settings._save_settings()
    return settings.current_settings


@router.get("/potrace-color")
async def get_potrace_color_settings():
    """Get current Potrace color (precision) settings."""
    from backend.potrace_color_converter.settings import PotraceColorSettings

    return PotraceColorSettings().current_settings


@router.put("/potrace-color")
async def update_potrace_color_settings(updates: dict):
    """Update Potrace color (precision) settings (partial update)."""
    from backend.potrace_color_converter.settings import PotraceColorSettings

    settings = PotraceColorSettings()

    for key, value in updates.items():
        if key not in settings.current_settings:
            raise HTTPException(status_code=400, detail=f"Unknown setting: {key}")

        setting = settings.current_settings[key]
        setting_type = setting.get("type")

        if setting_type == "boolean":
            if not isinstance(value, bool):
                raise HTTPException(status_code=400, detail=f"{key} must be a boolean")
            setting["value"] = value
        elif setting_type == "enum":
            options = setting.get("options", [])
            if value not in options:
                raise HTTPException(
                    status_code=400,
                    detail=f"{key} must be one of {options}",
                )
            setting["value"] = value
        elif "range" in setting:
            min_val, max_val = setting["range"]
            if not min_val <= value <= max_val:
                raise HTTPException(
                    status_code=400,
                    detail=f"{key} must be between {min_val} and {max_val}",
                )
            setting["value"] = value

    settings._save_settings()
    return settings.current_settings
