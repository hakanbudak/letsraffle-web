"""
Lets Raffle - Noel Baba karakter animasyonlari.

Blender 4.4+ / 5.x icinde calistirilir (Scripting sekmesi veya MCP):

    ns = {}
    exec(open(".../art/build_character.py").read(), ns)
    exec(open(".../art/build_santa.py").read(), ns)
    ns["build_character"](); ns["toon_scene"]()
    apply_mood("wave")          # sahneyi o moda gore kurar
    render_mood("wave")         # art/renders/wave/ altina PNG kareler

Modlar: wave, thinking, sad, celebrate  (MOODS sozlugu)
Web: build_character.export_glb() + npm run santa:pack (bkz. art/README.md)
"""
import bpy
import math
import os
from mathutils import Vector

R = math.radians
O = bpy.data.objects
FRAMES = 48
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(bpy.data.filepath))) if bpy.data.filepath else ""

ANIMATED = [
    "NoelBaba_Root", "UstGovde_Pivot", "Kafa_Pivot", "Sapka_Pivot", "Sapka_Uc_Pivot",
    "Kol_Pivot_L", "Kol_Pivot_R", "Goz_1", "Goz_-1", "Kas_1", "Kas_-1", "Agiz",
    "Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4",
]


# ----------------------------------------------------------------------------
# one-time scene preparation (idempotent)
# ----------------------------------------------------------------------------
def _mat(name, rgb, rough=0.5):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    m.diffuse_color = (*rgb, 1)
    return m


def _link(o, coll, mat=None, parent=None):
    for uc in o.users_collection:
        uc.objects.unlink(o)
    coll.objects.link(o)
    if mat:
        o.data.materials.append(mat)
    if o.type == 'MESH':
        for p in o.data.polygons:
            p.use_smooth = True
    if parent:
        bpy.context.view_layer.update()
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o


def prepare_scene():
    santa = bpy.data.collections["NoelBaba"]
    acc = bpy.data.collections["Aksesuarlar"]

    # reset arm pivots to quaternion, hanging straight down (rest)
    for side in ("L", "R"):
        p = O[f"Kol_Pivot_{side}"]
        p.animation_data_clear()
        p.rotation_mode = 'QUATERNION'
        p.rotation_quaternion = (1, 0, 0, 0)
        p.scale = (1, 1, 1)
    bpy.context.view_layer.update()

    # eye highlights follow eyes
    for s in ("1", "-1"):
        hl, eye = O[f"Goz_Parlak_{s}"], O[f"Goz_{s}"]
        if hl.parent != eye:
            mw = hl.matrix_world.copy()
            hl.parent = eye
            hl.matrix_world = mw

    # mouth
    if "Agiz" not in O:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.08, location=(0, -0.455, 1.625))
        m = bpy.context.object
        m.name = "Agiz"
        _link(m, santa, _mat("Agiz_Ic", (0.28, 0.02, 0.04), 0.6), O["Kafa_Pivot"])
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.045, location=(0, -0.47, 1.6))
        t = bpy.context.object
        t.name = "Dil"
        t.scale = (1.2, 0.6, 0.6)
        _link(t, santa, _mat("Dil", (0.85, 0.3, 0.32), 0.5), m)

    # empty sack held in left hand (sad mood)
    if "BosCuval" not in O:
        arm = O["Kol_Pivot_L"]
        shx, shy, shz = globals().get("SHOULDER", (0.58, 0.0, 1.28))
        hx, hy, hz = shx, shy, shz - globals().get("ARM_LEN", 0.62)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.24, location=(hx, hy - 0.02, hz - 0.3))
        sk = bpy.context.object
        sk.name = "BosCuval"
        sk.scale = (0.9, 0.38, 1.0)
        tex = bpy.data.textures.get("CuvalTex")
        d = sk.modifiers.new("Kirisik", "DISPLACE")
        d.texture = tex
        d.strength = 0.035
        _link(sk, acc, bpy.data.materials["Cuval"], arm)
        if "add_outline" in globals():
            add_outline(sk, 0.018)
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.1, radius2=0.05, depth=0.14, location=(hx, hy, hz - 0.07))
        nk = bpy.context.object
        nk.name = "BosCuval_Agiz"
        _link(nk, acc, bpy.data.materials["Cuval"], arm)
        if "add_outline" in globals():
            add_outline(nk, 0.018)

    # gift rest positions closer to the character (portrait framing)
    gift_rest = {
        "Hediye_1": (-1.0, -0.1, 0.0),
        "Hediye_3": (-0.98, -0.08, 0.4),
        "Hediye_2": (-0.6, -0.62, 0.0),
        "Hediye_4": (0.92, -0.4, 0.0),
    }
    for n, loc in gift_rest.items():
        O[n].location = loc

    # store rest transforms
    for n in ANIMATED:
        o = O[n]
        if "rest_loc" not in o:
            o["rest_loc"] = list(o.location)
            o["rest_scale"] = list(o.scale)
            o["rest_rot"] = list(o.rotation_euler)

    # camera: orthographic portrait 4:5
    cam = O["Kamera"]
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 3.75
    cam.location = (0, -10, 3.2)
    O["Kamera_Hedef"].location = (0, 0, 1.58)

    sc = bpy.context.scene
    sc.render.resolution_x = 720
    sc.render.resolution_y = 900
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.fps = 24
    sc.frame_start, sc.frame_end = 1, FRAMES
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.compression = 15
    try:
        sc.eevee.taa_render_samples = 32
    except Exception:
        pass


# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------
def reset_pose():
    for n in ANIMATED:
        o = O[n]
        o.animation_data_clear()
        o.location = o["rest_loc"]
        o.scale = o["rest_scale"]
        if o.rotation_mode == 'QUATERNION':
            o.rotation_quaternion = (1, 0, 0, 0)
        else:
            o.rotation_euler = o["rest_rot"]
    for side in ("L", "R"):
        O[f"Kol_Pivot_{side}"].scale = (1, 1, 1)


def set_visible(name, visible):
    o = O[name]
    for x in [o] + list(o.children_recursive):
        x.hide_render = not visible
        x.hide_viewport = not visible


def arm_q(direction):
    return Vector((0, 0, -1)).rotation_difference(Vector(direction).normalized())


def rest(o, attr):
    return Vector(o[f"rest_{attr}"])


def key(name, path, frames):
    """frames: list of (frame, value); value is a sequence for the whole property."""
    o = O[name]
    for f, v in frames:
        if path == "rotation_quaternion":
            o.rotation_quaternion = v
        else:
            setattr(o, path, v)
        o.keyframe_insert(path, frame=f)


def loc(name, frames):
    """frames: (frame, (dx,dy,dz)) offsets from rest."""
    r = rest(O[name], "loc")
    key(name, "location", [(f, r + Vector(d)) for f, d in frames])


def rot(name, frames):
    """frames: (frame, (x,y,z) degrees) offsets from rest."""
    r = rest(O[name], "rot")
    key(name, "rotation_euler", [(f, r + Vector([R(a) for a in d])) for f, d in frames])


def scl(name, frames):
    """frames: (frame, (sx,sy,sz)) multipliers of rest scale."""
    r = rest(O[name], "scale")
    key(name, "scale", [(f, Vector([r[i] * d[i] for i in range(3)])) for f, d in frames])


def arm(side, frames):
    """frames: (frame, direction vector)"""
    key(f"Kol_Pivot_{side}", "rotation_quaternion", [(f, arm_q(d)) for f, d in frames])


def finalize_cycles():
    from bpy_extras import anim_utils
    for n in ANIMATED:
        ad = O[n].animation_data
        if not ad or not ad.action:
            continue
        cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
        if not cb:
            continue
        for fc in cb.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'BEZIER'
                kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'
            if not any(m.type == 'CYCLES' for m in fc.modifiers):
                fc.modifiers.new('CYCLES')
            fc.update()


def blink(start):
    for s in ("1", "-1"):
        base = O[f"Goz_{s}"].scale.copy()
        r = rest(O[f"Goz_{s}"], "scale")
        mul = Vector([base[i] / r[i] for i in range(3)])
        scl(f"Goz_{s}", [(start, mul), (start + 2, (mul.x, mul.y, 0.08)), (start + 4, mul)])


def wave_loop(name, axis, amp, phase=0, period=FRAMES, base=(0, 0, 0)):
    """sinusoidal rotation (degrees) on one axis using 5 keys per period."""
    pts = []
    for i in range(5):
        f = 1 + phase + i * period / 4
        v = list(base)
        v[axis] += amp * [0, 1, 0, -1, 0][i]
        pts.append((f, tuple(v)))
    rot(name, pts)


# ----------------------------------------------------------------------------
# moods
# ----------------------------------------------------------------------------
def mood_wave():
    set_visible("Cuval_Root", False)
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4"):
        set_visible(g, False)
    set_visible("BosCuval", False)
    set_visible("BosCuval_Agiz", False)

    loc("UstGovde_Pivot", [(1, (0, 0, 0)), (13, (0, 0, 0.05)), (25, (0, 0, 0)), (37, (0, 0, 0.05)), (49, (0, 0, 0))])
    scl("UstGovde_Pivot", [(1, (1.02, 1.02, 0.97)), (13, (0.99, 0.99, 1.02)), (25, (1.02, 1.02, 0.97)),
                           (37, (0.99, 0.99, 1.02)), (49, (1.02, 1.02, 0.97))])
    wave_loop("UstGovde_Pivot", 1, 3)

    def wdir(deg):
        a = R(deg)
        return (-math.sin(a), -0.18, -math.cos(a))
    arm("R", [(1, wdir(142)), (7, wdir(162)), (13, wdir(124)), (19, wdir(162)), (25, wdir(124)),
              (31, wdir(162)), (37, wdir(124)), (43, wdir(162)), (49, wdir(142))])
    arm("L", [(1, (0.42, -0.08, -1)), (25, (0.5, -0.08, -1)), (49, (0.42, -0.08, -1))])

    rot("Kafa_Pivot", [(1, (0, 0, 0)), (13, (0, -6, 5)), (37, (0, 6, -5)), (49, (0, 0, 0))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (17, (0, -8, 0)), (41, (0, 8, 0)), (49, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (21, (0, -15, 0)), (45, (0, 12, 0)), (49, (0, 0, 0))])

    scl("Agiz", [(1, (1.0, 1.0, 1.0)), (25, (1.06, 1.0, 1.12)), (49, (1.0, 1.0, 1.0))])
    blink(28)


def mood_thinking():
    for g in ("Cuval_Root", "Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4", "BosCuval", "BosCuval_Agiz"):
        set_visible(g, False)

    # right hand to the beard, strokes it
    sx, sy, sz = globals().get("SHOULDER", (0.58, 0.0, 1.28))
    sh = Vector((-sx, sy, sz))
    chin_hi = Vector((-0.27, -0.66, 1.27))
    chin_lo = Vector((-0.24, -0.68, 1.16))
    arm("R", [(1, chin_hi - sh), (13, chin_lo - sh), (25, chin_hi - sh), (37, chin_lo - sh), (49, chin_hi - sh)])
    key("Kol_Pivot_R", "scale", [(1, (1, 1, 1.35))])
    arm("L", [(1, (0.36, -0.1, -1)), (25, (0.4, -0.1, -1)), (49, (0.36, -0.1, -1))])
    wave_loop("UstGovde_Pivot", 1, 2.5, period=FRAMES)
    scl("UstGovde_Pivot", [(1, (1, 1, 1)), (25, (1.01, 1.01, 0.985)), (49, (1, 1, 1))])

    rot("Kafa_Pivot", [(1, (-6, 10, 4)), (25, (-8, 14, 8)), (49, (-6, 10, 4))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (25, (0, -6, 0)), (49, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (25, (0, -12, 0)), (49, (0, 0, 0))])

    # eyes look up and to the side
    for s in ("1", "-1"):
        loc(f"Goz_{s}", [(1, (-0.02, 0.005, 0.035)), (25, (-0.03, 0.006, 0.04)), (49, (-0.02, 0.005, 0.035))])
    loc("Kas_-1", [(1, (0, 0, 0.035)), (25, (0, 0, 0.045)), (49, (0, 0, 0.035))])
    rot("Kas_1", [(1, (0, -14, 0))])
    scl("Agiz", [(1, (0.5, 1.0, 0.4)), (25, (0.55, 1.0, 0.45)), (49, (0.5, 1.0, 0.4))])
    blink(38)


def mood_sad():
    for g in ("Cuval_Root", "Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4"):
        set_visible(g, False)
    set_visible("BosCuval", True)
    set_visible("BosCuval_Agiz", True)

    arm("R", [(1, (-0.2, -0.05, -1)), (25, (-0.22, -0.05, -1)), (49, (-0.2, -0.05, -1))])
    arm("L", [(1, (0.32, -0.12, -1)), (13, (0.36, -0.06, -1)), (25, (0.32, -0.12, -1)),
              (37, (0.28, -0.16, -1)), (49, (0.32, -0.12, -1))])

    rot("UstGovde_Pivot", [(1, (6, 0, 0))])
    scl("UstGovde_Pivot", [(1, (1.02, 1.02, 0.95)), (25, (1.0, 1.0, 0.98)), (49, (1.02, 1.02, 0.95))])

    rot("Kafa_Pivot", [(1, (14, 0, 0)), (13, (14, 0, 9)), (25, (15, 0, 0)), (37, (14, 0, -9)), (49, (14, 0, 0))])
    rot("Sapka_Pivot", [(1, (12, -10, 0)), (25, (14, -14, 0)), (49, (12, -10, 0))])
    rot("Sapka_Uc_Pivot", [(1, (25, -20, 0)), (25, (30, -25, 0)), (49, (25, -20, 0))])

    for s in ("1", "-1"):
        scl(f"Goz_{s}", [(1, (1, 1, 0.55))])
        loc(f"Goz_{s}", [(1, (0, 0, -0.02))])
        sign = 1 if s == "1" else -1
        rot(f"Kas_{s}", [(1, (0, 22 * sign, 0))])
        loc(f"Kas_{s}", [(1, (-0.01 * sign, 0, 0.015))])
    scl("Agiz", [(1, (0.6, 1.0, 0.38))])


def mood_celebrate():
    set_visible("Cuval_Root", False)
    set_visible("BosCuval", False)
    set_visible("BosCuval_Agiz", False)
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4"):
        set_visible(g, True)

    # two jumps per loop
    jump = []
    for base in (1, 25):
        jump += [(base, (0, 0, 0)), (base + 4, (0, 0, 0.14)), (base + 8, (0, 0, 0.3)),
                 (base + 12, (0, 0, 0.14)), (base + 15, (0, 0, 0)), (base + 19, (0, 0, 0))]
    jump.append((49, (0, 0, 0)))
    loc("NoelBaba_Root", jump)
    sq = []
    for base in (1, 25):
        sq += [(base, (1.06, 1.06, 0.9)), (base + 4, (0.96, 0.96, 1.06)), (base + 8, (1, 1, 1)),
               (base + 13, (0.98, 0.98, 1.03)), (base + 15, (1.07, 1.07, 0.88)), (base + 19, (1.06, 1.06, 0.9))]
    sq.append((49, (1.06, 1.06, 0.9)))
    scl("UstGovde_Pivot", sq)

    def up(side, spread):
        sx = -1 if side == "R" else 1
        return (sx * spread, -0.15, 0.9)
    arm("R", [(1, up("R", 0.55)), (7, up("R", 0.3)), (13, up("R", 0.55)), (19, up("R", 0.3)),
              (25, up("R", 0.55)), (31, up("R", 0.3)), (37, up("R", 0.55)), (43, up("R", 0.3)), (49, up("R", 0.55))])
    arm("L", [(1, up("L", 0.3)), (7, up("L", 0.55)), (13, up("L", 0.3)), (19, up("L", 0.55)),
              (25, up("L", 0.3)), (31, up("L", 0.55)), (37, up("L", 0.3)), (43, up("L", 0.55)), (49, up("L", 0.3))])

    rot("Kafa_Pivot", [(1, (-4, 0, 0)), (13, (-4, 7, 0)), (37, (-4, -7, 0)), (49, (-4, 0, 0))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (9, (0, -12, 0)), (21, (0, 6, 0)), (33, (0, -12, 0)), (45, (0, 6, 0)), (49, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (11, (0, -25, 0)), (23, (0, 18, 0)), (35, (0, -25, 0)), (47, (0, 18, 0)), (49, (0, 0, 0))])

    for s in ("1", "-1"):
        scl(f"Goz_{s}", [(1, (1, 1, 0.35))])
        loc(f"Kas_{s}", [(1, (0, 0, 0.03))])
    scl("Agiz", [(1, (1.2, 1.0, 1.35)), (9, (1.3, 1.0, 1.55)), (25, (1.2, 1.0, 1.35)), (33, (1.3, 1.0, 1.55)), (49, (1.2, 1.0, 1.35))])

    # gifts hop with offsets
    for name, ph in (("Hediye_2", 0), ("Hediye_4", 6), ("Hediye_1", 12), ("Hediye_3", 12)):
        pts = []
        for base in (1, 25):
            b = base + ph
            pts += [(b, (0, 0, 0)), (b + 5, (0, 0, 0.16)), (b + 10, (0, 0, 0))]
        pts = [(f if f <= 49 else f - 48, v) for f, v in pts]
        pts = sorted({f: v for f, v in pts}.items())
        if pts[0][0] != 1:
            pts.insert(0, (1, (0, 0, 0)))
        if pts[-1][0] != 49:
            pts.append((49, pts[0][1]))
        loc(name, pts)
        rot(name, [(1, (0, 0, 0)), (13, (0, 0, 6)), (37, (0, 0, -6)), (49, (0, 0, 0))])


MOODS = {
    "wave": mood_wave,
    "thinking": mood_thinking,
    "sad": mood_sad,
    "celebrate": mood_celebrate,
}


def apply_mood(name):
    prepare_scene()
    reset_pose()
    MOODS[name]()
    finalize_cycles()
    bpy.context.scene.frame_set(1)


def render_mood(name, out_root=None, frames=None):
    apply_mood(name)
    out_root = out_root or os.path.join(PROJECT_DIR, "art", "renders")
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(out_root, name, "frame_")
    if frames:
        sc.frame_start, sc.frame_end = frames
    bpy.ops.render.render(animation=True)
    sc.frame_start, sc.frame_end = 1, FRAMES
