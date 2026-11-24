/**
 * The "3D Prototypes" desktop folder, copied from the real one on the desk:
 * each entry is [name shown, picture file in public/images/prototypes, 1 if it is a folder].
 * The pictures are the real Windows thumbnails, so nothing here is drawn live.
 */
export const PROTOTYPES = "3D Prototypes";
export const PROTOTYPE_IMAGES = "/images/prototypes/";
export type PrototypeEntry = [name: string, picture: string, folder?: 1];

export const PROTOTYPE_PLACES: Record<string, PrototypeEntry[]> = {
  "3D Prototypes": [
    ["Build", "build", 1],
    ["Final Products", "final-products", 1],
    ["GLBs", "glbs", 1],
    ["beanie", "beanie"],
    ["floating_ghost_t-shirt_model", "floating-ghost-t-shirt-model"],
    ["hoodie", "hoodie"],
    ["hoodie_sweatshirt", "hoodie-sweatshirt"],
    ["long_sleeve_t-_shirt", "long-sleeve-t-shirt"],
    ["sweatshirt_warm", "sweatshirt-warm"],
    ["t_shirt_v", "t-shirt-v"],
    ["unbranded_white_sneaker", "unbranded-white-sneaker"],
  ],
  "3D Prototypes/Build": [
    ["Face Cap", "face-cap", 1],
    ["TShirt Logo Project", "tshirt-logo-project", 1],
  ],
  "3D Prototypes/Final Products": [
    ["Black Chucky Shirt", "black-chucky-shirt"],
    ["White Chucky Shirt", "white-chucky-shirt"],
    ["White DON ELCLASICO BaseBall Cap", "white-don-elclasico-baseball-cap"],
  ],
  "3D Prototypes/GLBs": [
    ["3d_rigged_cristiano_ronaldo_al_nassr", "glb-3d-rigged-cristiano-ronaldo-al-nassr"],
    ["apples_smart_watch_ios", "glb-apples-smart-watch-ios"],
    ["black_nikes", "glb-black-nikes"],
    ["black_sneakers", "glb-black-sneakers"],
    ["canada_goose_winter_jacket (1)", "glb-canada-goose-winter-jacket-1"],
    ["conference_room", "glb-conference-room"],
    ["fila_sneaker_scan_quarantine_freebie", "glb-fila-sneaker-scan-quarantine-freebie"],
    ["iphone_16_-_free", "glb-iphone-16-free"],
    ["jnco_twin_cannon_baggy_jeans", "glb-jnco-twin-cannon-baggy-jeans"],
    ["laptop", "glb-laptop"],
    ["men_jacket", "glb-men-jacket"],
    ["men_regular_apparel_fit_sporty_t-shirt", "glb-men-regular-apparel-fit-sporty-t-shirt"],
    ["neon_sneakers", "glb-neon-sneakers"],
    ["oversized-t-shirt", "glb-oversized-t-shirt"],
    ["projector_screen_7mb", "glb-projector-screen-7mb"],
    ["rayban_sunglasses", "glb-rayban-sunglasses"],
    ["salomon_xt6_sneaker_photo_scan", "glb-salomon-xt6-sneaker-photo-scan"],
    ["scifi_tron_studio__baked (1)", "glb-scifi-tron-studio-baked-1"],
    ["scifi_tron_studio__baked", "glb-scifi-tron-studio-baked"],
    ["shirt", "glb-shirt"],
    ["shirt_fixed", "glb-shirt-fixed"],
    ["shirt_with_pants_3d_model_free (1)", "glb-shirt-with-pants-3d-model-free-1"],
    ["smart_watch", "glb-smart-watch"],
    ["sneaker_-_3d_design_exercise", "glb-sneaker-3d-design-exercise"],
    ["studio_office_interior", "glb-studio-office-interior"],
    ["sweatshirt", "glb-sweatshirt"],
    ["t_shirt_hoodie_3d_model", "glb-t-shirt-hoodie-3d-model"],
    ["video_projector", "glb-video-projector"],
    ["virtual_studio_ver_02", "glb-virtual-studio-ver-02"],
    ["vr_art_gallery", "glb-vr-art-gallery"],
    ["vr_theater", "glb-vr-theater"],
  ],
  "3D Prototypes/Build/Face Cap": [
    ["add_logo_to_cap.py", "add-logo-to-cap-py"],
    ["BaseBall Cap", "baseball-cap"],
    ["BaseBall Cap.blend1", "baseball-cap-blend1"],
    ["baseball_hat_028", "baseball-hat-028"],
    ["Tshirt_Logo_Texture_CROPPED", "tshirt-logo-texture-cropped"],
  ],
  "3D Prototypes/Build/TShirt Logo Project": [
    ["6bed76c0-f70c-4fde-8ede-c44dea0c9c00", "6bed76c0-f70c-4fde-8ede-c44dea0c9c00"],
    ["chucky", "chucky"],
    ["DONELCLASICOVarsityJacket", "donelclasicovarsityjacket"],
    ["setup_tshirt_logo.py", "setup-tshirt-logo-py"],
    ["Tshirt_Logo_Texture_2048_TRANSPARENT", "tshirt-logo-texture-2048-transparent"],
    ["Tshirt_Logo_Texture_2048_WHITE", "tshirt-logo-texture-2048-white"],
    ["Tshirt_Logo_Texture_CROPPED", "tshirt-logo-texture-cropped"],
    ["Tshirt_Logo_WHITE", "tshirt-logo-white"],
    ["Tshirt_Logo_WHITE_v2", "tshirt-logo-white-v2"],
    ["Untitled", "untitled"],
    ["Untitled.blend1", "untitled-blend1"],
  ],
};

/** Files in this folder show a green "synced" tick before their name, like on the real PC. */
export const PROTOTYPE_SYNCED = new Set(["3D Prototypes/GLBs"]);
