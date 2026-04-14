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
