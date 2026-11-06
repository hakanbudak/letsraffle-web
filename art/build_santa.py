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
        scl(f"Goz_{s}", [(start, mul), (start + 3, (mul.x, mul.y, 0.08)), (start + 4, (mul.x, mul.y, 0.08)), (start + 8, mul)])


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


# ----------------------------------------------------------------------------
# draw: Noel Baba cuvala elini sokup bir kagit (cekilis notu) cikarir
# ----------------------------------------------------------------------------
DRAW_FRAMES = 72
CUVAL_REST = (1.15, 0.15, 0.0)


def ensure_paper():
    if "Kagit" in O:
        return O["Kagit"]
    acc = bpy.data.collections["Aksesuarlar"]
    arm = O["Kol_Pivot_L"]
    bpy.context.view_layer.update()
    hand = O["Eldiven_L"].matrix_world.translation.copy()
    base = hand + Vector((0, -0.07, -0.3))
    bpy.ops.mesh.primitive_cube_add(size=1, location=base)
    k = bpy.context.object
    k.name = "Kagit"
    k.scale = (0.34, 0.02, 0.44)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bv = k.modifiers.new("Yuvarla", "BEVEL")
    bv.width = 0.012
    bv.segments = 3
    mk = globals().get("toon_mat")
    paper_m = mk("Kagit", "#FFF6E3") if mk else _mat("Kagit", (1.0, 0.93, 0.8))
    _link(k, acc, paper_m, arm)
    # cizgiler (yazi)
    lines = []
    for i, z in enumerate((0.12, 0.05, -0.02)):
        bpy.ops.mesh.primitive_cube_add(size=1, location=base + Vector((-0.015 if i else 0, -0.013, z)))
        ln = bpy.context.object
        ln.name = f"Kagit_Yazi{i}"
        ln.scale = (0.22 if i else 0.16, 0.004, 0.018)
        ln_m = mk("Kagit_Yazi", "#C9A27A") if mk else _mat("Kagit_Yazi", (0.6, 0.45, 0.3))
        _link(ln, acc, ln_m, k)
    # mum muhur
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.065, depth=0.02, location=base + Vector((0, -0.017, -0.12)), rotation=(math.radians(90), 0, 0))
    sl = bpy.context.object
    sl.name = "Kagit_Muhur"
    sl_m = mk("Kagit_Muhur", "#B91C1C") if mk else _mat("Kagit_Muhur", (0.6, 0.05, 0.05))
    _link(sl, acc, sl_m, k)
    if "add_outline" in globals():
        add_outline(k, 0.014)
        add_outline(sl, 0.01)
    return k


def _cycle(o):
    from bpy_extras import anim_utils
    ad = o.animation_data
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
    for fc in cb.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
            kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'
        if not any(m.type == 'CYCLES' for m in fc.modifiers):
            fc.modifiers.new('CYCLES')
        fc.update()


def mood_draw():
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4", "BosCuval", "BosCuval_Agiz"):
        set_visible(g, False)
    set_visible("Cuval_Root", True)
    set_visible("Hediye_Cuvalda", False)
    cr = O["Cuval_Root"]
    cr.location = (1.0, -0.08, 0.0)
    cr.scale = (1.0, 1.0, 1.0)

    E = DRAW_FRAMES + 1
    paper = ensure_paper()
    set_visible("Kagit", True)
    paper.animation_data_clear()
    s0, s1 = (0.01, 0.01, 0.01), (1, 1, 1)
    for f, v in ((1, s0), (27, s0), (31, s1), (57, s1), (64, s0), (E, s0)):
        paper.scale = v
        paper.keyframe_insert("scale", frame=f)
    _cycle(paper)

    above, inside = (0.5, -0.1, 0.1), (0.42, -0.12, -0.5)
    up = (0.7, -0.3, 0.65)
    arm("L", [(1, above), (9, inside), (14, (0.38, -0.1, -0.52)), (19, (0.46, -0.14, -0.46)),
              (24, (0.4, -0.12, -0.5)), (30, (0.5, -0.12, 0.0)), (38, up), (46, (0.62, -0.3, 0.74)),
              (54, up), (62, (0.5, -0.1, 0.12)), (66, (0.44, -0.12, -0.3)), (E, above)])
    arm("R", [(1, (-0.55, -0.1, -0.85)), (24, (-0.58, -0.12, -0.82)), (38, (-0.62, -0.3, 0.3)),
              (46, (-0.58, -0.3, 0.42)), (54, (-0.62, -0.3, 0.3)), (64, (-0.55, -0.1, -0.85)), (E, (-0.55, -0.1, -0.85))])

    rot("UstGovde_Pivot", [(1, (0, 4, 0)), (9, (4, 8, 0)), (24, (4, 8, 0)), (36, (0, -1, 0)),
                           (54, (0, -1, 0)), (64, (2, 5, 0)), (E, (0, 4, 0))])
    loc("NoelBaba_Root", [(1, (0, 0, 0)), (34, (0, 0, 0)), (38, (0, 0, 0.09)), (42, (0, 0, 0)), (E, (0, 0, 0))])
    scl("UstGovde_Pivot", [(1, (1, 1, 1)), (34, (1.04, 1.04, 0.95)), (38, (0.98, 0.98, 1.03)), (42, (1.02, 1.02, 0.98)), (48, (1, 1, 1)), (E, (1, 1, 1))])

    rot("Kafa_Pivot", [(1, (6, 0, 14)), (9, (12, 0, 20)), (24, (12, 0, 18)), (34, (0, 0, 6)),
                       (40, (-8, 0, 4)), (54, (-8, 0, -4)), (64, (6, 0, 14)), (E, (6, 0, 14))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (12, (0, 8, 0)), (26, (0, 6, 0)), (40, (0, -10, 0)), (52, (0, 4, 0)), (E, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (14, (0, 16, 0)), (28, (0, 10, 0)), (42, (0, -22, 0)), (54, (0, 10, 0)), (E, (0, 0, 0))])

    for s in ("1", "-1"):
        loc(f"Goz_{s}", [(1, (0.02, 0, -0.015)), (28, (0.02, 0, -0.015)), (34, (0, 0, 0.01)), (60, (0, 0, 0.01)), (E, (0.02, 0, -0.015))])
        scl(f"Goz_{s}", [(1, (1, 1, 1)), (34, (1, 1, 1)), (38, (1, 1, 0.4)), (58, (1, 1, 0.4)), (63, (1, 1, 1)), (E, (1, 1, 1))])
        loc(f"Kas_{s}", [(1, (0, 0, 0)), (34, (0, 0, 0)), (38, (0, 0, 0.03)), (58, (0, 0, 0.03)), (E, (0, 0, 0))])
    scl("Agiz", [(1, (0.8, 1, 0.8)), (12, (0.7, 1, 0.95)), (26, (0.7, 1, 0.95)), (36, (1.25, 1, 1.45)),
                 (56, (1.25, 1, 1.45)), (64, (0.8, 1, 0.8)), (E, (0.8, 1, 0.8))])
    blink(18)

    # kamera cuvali da kapsasin
    O["Kamera"].location = (0.1, -10, 3.2)
    O["Kamera_Hedef"].location = (0.1, 0, 1.5)


MOODS["draw"] = mood_draw


def _reset_draw_extras():
    if "Kagit" in O:
        set_visible("Kagit", False)
    cr = O["Cuval_Root"]
    cr.location = CUVAL_REST
    cr.scale = (1, 1, 1)
    set_visible("Hediye_Cuvalda", True)


_apply_mood_orig = apply_mood


def apply_mood(name):
    prepare_scene()
    reset_pose()
    _reset_draw_extras()
    MOODS[name]()
    finalize_cycles()
    bpy.context.scene.frame_set(1)


# ----------------------------------------------------------------------------
# draw icin detayli, agzi acik cuval
# ----------------------------------------------------------------------------
SACK_ROOT_LOC = (0.9, -0.22, 0.0)
HAND_REACH = 0.5
SACK_SCALE = 0.85
SACK_ROOT_ROT = (12, 0, -10)
SACK_RIM_Z = 0.8


def _lathe(name, profile, steps=56):
    import bmesh
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in profile]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o


def _tm(name, base, shadow=None):
    mk = globals().get("toon_mat")
    if mk:
        return mk(name, base, shadow)
    h = base.lstrip("#")
    return _mat(name, tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)))


def _ol(o, w=0.016):
    if "add_outline" in globals():
        add_outline(o, w)


def _part(o, coll, mat, root, w=0.016, outline=True):
    _link(o, coll, mat, root)
    if outline:
        _ol(o, w)
    return o


def _texture(name, kind, size, **kw):
    t = bpy.data.textures.get(name) or bpy.data.textures.new(name, kind)
    t.noise_scale = size
    for k, v in kw.items():
        setattr(t, k, v)
    return t


def ensure_open_sack():
    if "AcikCuval_Root" in O:
        return O["AcikCuval_Root"]
    acc = bpy.data.collections["Aksesuarlar"]
    root = bpy.data.objects.new("AcikCuval_Root", None)
    acc.objects.link(root)

    burlap = _tm("T_Cuval", "#C4925A", "#8E6236")
    burlap_l = _tm("T_Cuval_Kenar", "#D9AE74", "#A57B45")
    inside = _tm("T_Cuval_Ic", "#3E2414", "#2A170C")
    cream = _tm("T_Dikis", "#FFF4DD", "#E3CFA8")
    red = _tm("T_Yama", "#B91C1C", "#7A0F14")
    gold = _tm("T_Ip_Altin", "#E6B94A", "#B08A2E")
    green = _tm("T_Hediye_Yesil", "#2F7A55", "#1F5C3E")
    paper = _tm("T_Not", "#FFF8EA", "#E8D8BC")

    # govde: tabani duz, gobekli, boyna dogru daralan, agza dogru acilan
    prof = [(0.0, 0.0), (0.26, 0.0), (0.4, 0.05), (0.48, 0.16), (0.51, 0.3), (0.5, 0.44), (0.45, 0.56),
            (0.37, 0.64), (0.31, 0.69), (0.3, 0.72), (0.33, 0.76), (0.39, SACK_RIM_Z)]
    body = _lathe("AcikCuval", prof)
    sub = body.modifiers.new("Sub", "SUBSURF")
    sub.levels = sub.render_levels = 2
    folds = _texture("Cuval_Kivrim", 'WOOD', 0.09, wood_type='RINGS', noise_basis_2='SIN', turbulence=6.0)
    d1 = body.modifiers.new("Kivrim", "DISPLACE")
    d1.texture = folds
    d1.strength = 0.018
    d1.texture_coords = 'LOCAL'
    lumps = _texture("Cuval_Yumru", 'CLOUDS', 0.22)
    d2 = body.modifiers.new("Yumru", "DISPLACE")
    d2.texture = lumps
    d2.strength = 0.07
    d2.mid_level = 0.55
    weave = _texture("Cuval_Dokuma", 'CLOUDS', 0.012)
    d3 = body.modifiers.new("Dokuma", "DISPLACE")
    d3.texture = weave
    d3.strength = 0.006
    _part(body, acc, burlap, root, 0.02)

    # ic karanlik: agzin biraz altinda koyu disk + ic duvar
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.355, depth=0.01, location=(0, 0, 0.705))
    _part(bpy.context.object, acc, inside, root, outline=False).name = "AcikCuval_Ic"
    inner = _lathe("AcikCuval_IcDuvar", [(0.3, 0.7), (0.33, 0.76), (0.375, SACK_RIM_Z - 0.005)], steps=40)
    inner.scale = (0.97, 0.97, 1)
    _part(inner, acc, inside, root, outline=False)

    # agiz kenari (katlanmis kumas) + dikis izleri
    bpy.ops.mesh.primitive_torus_add(major_radius=0.4, minor_radius=0.045, major_segments=56, minor_segments=14,
                                     location=(0, 0, SACK_RIM_Z))
    rim = bpy.context.object
    rim.name = "AcikCuval_Kenar"
    rim.scale = (1, 1, 0.8)
    rd = rim.modifiers.new("Kivrim", "DISPLACE")
    rd.texture = lumps
    rd.strength = 0.03
    _part(rim, acc, burlap_l, root, 0.016)
    for i in range(22):
        a = i / 22 * math.tau
        bpy.ops.mesh.primitive_cube_add(size=1, location=(math.cos(a) * 0.4, math.sin(a) * 0.4, SACK_RIM_Z + 0.038),
                                        rotation=(0, 0, a + math.pi / 2))
        st = bpy.context.object
        st.scale = (0.035, 0.008, 0.006)
        _part(st, acc, cream, root, outline=False).name = f"AcikCuval_Dikis{i}"

    # boyun bagi: kirmizi ip + fiyonk ve puskuller
    bpy.ops.mesh.primitive_torus_add(major_radius=0.315, minor_radius=0.03, major_segments=48, minor_segments=12,
                                     location=(0, 0, 0.705))
    _part(bpy.context.object, acc, red, root, 0.012).name = "AcikCuval_Ip"
    for sgn in (-1, 1):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=0.07,
                                             location=(sgn * 0.075, -0.31, 0.71))
        loop = bpy.context.object
        loop.scale = (1.0, 0.45, 0.6)
        loop.rotation_euler = (0, R(-25 * sgn), 0)
        _part(loop, acc, red, root, 0.012).name = f"AcikCuval_Fiyonk{sgn}"
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.016, depth=0.2,
                                            location=(sgn * 0.05, -0.33, 0.6), rotation=(0, R(12 * sgn), 0))
        _part(bpy.context.object, acc, red, root, 0.01).name = f"AcikCuval_IpUc{sgn}"
        bpy.ops.mesh.primitive_cone_add(vertices=14, radius1=0.04, radius2=0.012, depth=0.08,
                                        location=(sgn * 0.072, -0.335, 0.49))
        _part(bpy.context.object, acc, gold, root, 0.01).name = f"AcikCuval_Puskul{sgn}"
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.035, location=(0, -0.32, 0.71))
    _part(bpy.context.object, acc, red, root, 0.01).name = "AcikCuval_Dugum"

    # on yuzde yama + altin yildiz + dikisler
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.06, -0.505, 0.3), rotation=(R(-6), 0, R(4)))
    patch = bpy.context.object
    patch.name = "AcikCuval_Yama"
    patch.scale = (0.24, 0.02, 0.22)
    bv = patch.modifiers.new("Bevel", "BEVEL")
    bv.width = 0.02
    bv.segments = 2
    _part(patch, acc, red, root, 0.012)
    for i in range(16):
        side, t = divmod(i, 4)
        f = (t + 0.5) / 4 - 0.5
        pts = [(f * 0.2, 0.1), (0.1, f * 0.18), (-f * 0.2, -0.1), (-0.1, -f * 0.18)]
        x, z = pts[side]
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.06 + x, -0.518, 0.3 + z))
        st = bpy.context.object
        st.scale = (0.03, 0.006, 0.007) if side % 2 == 0 else (0.007, 0.006, 0.03)
        _part(st, acc, cream, root, outline=False).name = f"AcikCuval_YamaDikis{i}"
    import bmesh
    me = bpy.data.meshes.new("Yildiz")
    bm = bmesh.new()
    pts = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        r = 0.075 if i % 2 == 0 else 0.032
        pts.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
    f = bm.faces.new(pts)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)], vec=(0, -0.018, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    star = bpy.data.objects.new("AcikCuval_Yildiz", me)
    star.location = (0.06, -0.522, 0.3)
    star.rotation_euler = (R(-6), 0, R(4))
    _part(star, acc, gold, root, 0.008)

    # agizdan tasan: hediye kutusu + cekilis notlari
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.13, 0.08, 0.84), rotation=(R(12), R(-18), R(20)))
    gb = bpy.context.object
    gb.name = "AcikCuval_Hediye"
    gb.scale = (0.2, 0.2, 0.2)
    bvg = gb.modifiers.new("Bevel", "BEVEL")
    bvg.width = 0.015
    bvg.segments = 2
    _part(gb, acc, green, root, 0.014)
    for k, (sx, sz) in enumerate(((0.045, 0.205), (0.205, 0.045))):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.13, 0.08, 0.84), rotation=(R(12), R(-18), R(20)))
        rb = bpy.context.object
        rb.scale = (sx, 0.205, sz) if k == 0 else (0.205, 0.045, 0.205)
        _part(rb, acc, gold, root, outline=False).name = f"AcikCuval_HediyeKurdele{k}"
    for k, (x, y, rx, ry) in enumerate(((-0.12, -0.02, -14, 16), (-0.02, -0.08, -8, -10), (-0.2, 0.06, 6, 24))):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 0.82), rotation=(R(rx), R(ry), R(10 * k)))
        nt = bpy.context.object
        nt.name = f"AcikCuval_Not{k}"
        nt.scale = (0.13, 0.012, 0.19)
        _part(nt, acc, paper, root, 0.01)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y - 0.008, 0.85), rotation=(R(rx), R(ry), R(10 * k)))
        ln = bpy.context.object
        ln.scale = (0.08, 0.004, 0.012)
        _part(ln, acc, _tm("T_Not_Yazi", "#C9A27A"), nt, outline=False).name = f"AcikCuval_NotYazi{k}"

    root.location = SACK_ROOT_LOC
    root.rotation_euler = tuple(R(a) for a in SACK_ROOT_ROT)
    root.scale = (SACK_SCALE,) * 3
    return root


def _sack_rest():
    r = O.get("AcikCuval_Root")
    if r:
        r.animation_data_clear()
        r.location = SACK_ROOT_LOC
        r.rotation_euler = tuple(R(a) for a in SACK_ROOT_ROT)
        r.scale = (SACK_SCALE,) * 3
        for c in r.children:
            if c.name.startswith("AcikCuval_Not") and c.animation_data:
                c.animation_data_clear()
    return r


def mood_draw():
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4", "BosCuval", "BosCuval_Agiz", "Cuval_Root"):
        set_visible(g, False)
    root = ensure_open_sack()
    _sack_rest()
    set_visible("AcikCuval_Root", True)

    E = DRAW_FRAMES + 1
    paper = ensure_paper()
    set_visible("Kagit", True)
    paper.animation_data_clear()
    s0, s1 = (0.01, 0.01, 0.01), (1, 1, 1)
    for f, v in ((1, s0), (27, s0), (31, s1), (57, s1), (64, s0), (E, s0)):
        paper.scale = v
        paper.keyframe_insert("scale", frame=f)
    _cycle(paper)

    # el: agzin ustu -> derine dal -> karistir -> kagitla yukari -> geri
    up = (0.7, -0.3, 0.65)
    arm("R", [(1, (-0.5, -0.15, -0.85)), (24, (-0.55, -0.15, -0.82)), (38, (-0.62, -0.3, 0.3)),
              (46, (-0.58, -0.3, 0.42)), (54, (-0.62, -0.3, 0.3)), (64, (-0.5, -0.15, -0.85)), (E, (-0.5, -0.15, -0.85))])

    # govde cuvala dogru egilir
    rot("UstGovde_Pivot", [(1, (5, 6, -3)), (12, (9, 9, -4)), (24, (9, 9, -4)), (36, (0, -1, 0)),
                           (54, (0, -1, 0)), (64, (7, 7, -3)), (E, (5, 6, -3))])
    loc("NoelBaba_Root", [(1, (0, 0, 0)), (34, (0, 0, 0)), (38, (0, 0, 0.09)), (42, (0, 0, 0)), (E, (0, 0, 0))])
    # vucut cuvala dogru hafif doner: sol kol kameraya gelir
    rot("NoelBaba_Root", [(1, (0, 0, -10)), (10, (0, 0, -20)), (26, (0, 0, -20)), (36, (0, 0, 0)), (54, (0, 0, 0)), (64, (0, 0, -12)), (E, (0, 0, -10))])
    scl("UstGovde_Pivot", [(1, (1, 1, 1)), (34, (1.04, 1.04, 0.95)), (38, (0.98, 0.98, 1.03)), (42, (1.02, 1.02, 0.98)),
                           (48, (1, 1, 1)), (E, (1, 1, 1))])
    # kafa cuvalin icine bakar
    rot("Kafa_Pivot", [(1, (12, 0, 16)), (12, (18, 0, 22)), (24, (18, 0, 20)), (34, (0, 0, 6)),
                       (40, (-8, 0, 4)), (54, (-8, 0, -4)), (64, (12, 0, 16)), (E, (12, 0, 16))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (12, (0, 10, 0)), (26, (0, 6, 0)), (40, (0, -10, 0)), (52, (0, 4, 0)), (E, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (14, (0, 18, 0)), (28, (0, 10, 0)), (42, (0, -22, 0)), (54, (0, 10, 0)), (E, (0, 0, 0))])
    for s in ("1", "-1"):
        loc(f"Goz_{s}", [(1, (0.025, 0, -0.025)), (28, (0.025, 0, -0.025)), (34, (0, 0, 0.01)), (60, (0, 0, 0.01)), (E, (0.025, 0, -0.025))])
        scl(f"Goz_{s}", [(1, (1, 1, 1)), (34, (1, 1, 1)), (38, (1, 1, 0.4)), (58, (1, 1, 0.4)), (63, (1, 1, 1)), (E, (1, 1, 1))])
        loc(f"Kas_{s}", [(1, (0, 0, 0)), (14, (0, 0, 0.02)), (26, (0, 0, 0.02)), (34, (0, 0, 0)), (38, (0, 0, 0.03)), (58, (0, 0, 0.03)), (E, (0, 0, 0))])
    scl("Agiz", [(1, (0.8, 1, 0.8)), (12, (0.6, 1, 1.05)), (26, (0.6, 1, 1.05)), (36, (1.25, 1, 1.45)),
                 (56, (1.25, 1, 1.45)), (64, (0.8, 1, 0.8)), (E, (0.8, 1, 0.8))])
    blink(46)

    # cuval: el girerken cokup, karistirirken sallanir
    base = Vector(SACK_ROOT_ROT)
    rl = []
    for f, sc_, dr in ((1, (1, 1, 1), (0, 0, 0)), (10, (1.05, 1.05, 0.94), (2, 0, 0)), (14, (0.97, 0.97, 1.04), (-1, 3, 0)),
                       (18, (1.04, 1.04, 0.95), (2, -3, 0)), (22, (0.98, 0.98, 1.03), (0, 3, 0)),
                       (26, (1.03, 1.03, 0.96), (1, -2, 0)), (31, (0.97, 0.97, 1.05), (-2, 0, 0)),
                       (36, (1, 1, 1), (0, 0, 0)), (64, (1, 1, 1), (0, 0, 0)), (67, (1.04, 1.04, 0.95), (2, 0, 0)), (E, (1, 1, 1), (0, 0, 0))):
        root.scale = tuple(v * SACK_SCALE for v in sc_)
        root.keyframe_insert("scale", frame=f)
        root.rotation_euler = tuple(R(a + b) for a, b in zip(base, dr))
        root.keyframe_insert("rotation_euler", frame=f)
    _cycle(root)
    for k in range(3):
        n = O[f"AcikCuval_Not{k}"]
        r0 = n.rotation_euler.copy()
        for f, dz in ((1, 0), (12, 6), (16, -6), (20, 5), (24, -5), (30, 0), (E, 0)):
            n.rotation_euler = (r0.x + R(dz * (1 if k % 2 else -1)), r0.y, r0.z)
            n.keyframe_insert("rotation_euler", frame=f + k)
        n.rotation_euler = r0
        _cycle(n)


    # sol kol: dunya koordinatinda hedefe (cuval agzi) gore anahtarla
    sc = bpy.context.scene
    pv = O["Kol_Pivot_L"]
    up_keys = [(36, up), (46, (0.62, -0.3, 0.74)), (54, up)]
    arm("L", up_keys)
    for f, _ in up_keys:
        pv.scale = (1, 1, 1)
        pv.keyframe_insert("scale", frame=f)

    def arm_to(f, off):
        sc.frame_set(f)
        bpy.context.view_layer.update()
        mouth = root.matrix_world @ Vector((0, 0, SACK_RIM_Z))
        target = mouth + Vector(off)
        pw = pv.matrix_world.translation.copy()
        par = (pv.parent.matrix_world @ pv.matrix_parent_inverse).to_3x3()
        d_world = target - pw
        d_local = par.inverted() @ d_world
        scale_world = par.to_scale()
        L = d_world.length / (HAND_REACH * scale_world.z)
        pv.rotation_quaternion = arm_q(d_local)
        pv.keyframe_insert("rotation_quaternion", frame=f)
        pv.scale = (1, 1, max(0.85, L))
        pv.keyframe_insert("scale", frame=f)

    for f, off in ((1, (0.0, -0.02, 0.2)), (6, (0.0, 0.0, 0.08)), (10, (0.0, 0.02, -0.12)),
                   (14, (-0.04, 0.04, -0.2)), (18, (0.05, 0.0, -0.17)), (22, (-0.03, 0.05, -0.21)),
                   (26, (0.02, 0.02, -0.15)), (30, (0.0, 0.0, 0.04)),
                   (60, (0.0, -0.02, 0.2)), (64, (0.0, 0.0, 0.06)), (68, (0.0, 0.02, -0.06)), (E, (0.0, -0.02, 0.2))):
        arm_to(f, off)
    # E ile 1 ayni olsun
    sc.frame_set(1)

    O["Kamera"].location = (0.1, -10, 3.2)
    O["Kamera_Hedef"].location = (0.1, 0, 1.5)


MOODS["draw"] = mood_draw


def _reset_draw_extras():
    if "Kagit" in O:
        set_visible("Kagit", False)
    if "AcikCuval_Root" in O:
        _sack_rest()
        set_visible("AcikCuval_Root", False)
    cr = O["Cuval_Root"]
    cr.location = CUVAL_REST
    cr.scale = (1, 1, 1)
    set_visible("Hediye_Cuvalda", True)


# ----------------------------------------------------------------------------
# draw: her cekilisten once kisa bekleme, saga sola bakma
# ----------------------------------------------------------------------------
DRAW_IDLE = 40


def _add_idle(idle=DRAW_IDLE):
    from bpy_extras import anim_utils
    names = list(ANIMATED) + ["Kagit", "AcikCuval_Root"] + [f"AcikCuval_Not{k}" for k in range(3)]
    for n in names:
        o = O.get(n)
        if not o or not o.animation_data or not o.animation_data.action:
            continue
        ad = o.animation_data
        cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
        if not cb:
            continue
        for fc in cb.fcurves:
            for kp in fc.keyframe_points:
                kp.co.x += idle
                kp.handle_left.x += idle
                kp.handle_right.x += idle
            fc.update()
            first = min(kp.co.x for kp in fc.keyframe_points)
            v = fc.evaluate(first)
            fc.keyframe_points.insert(1, v)
            fc.update()
    a = 1 + idle
    # bekleme: kameraya bakar, saga sola goz gezdirir, tekrar cuvala doner
    rot("Kafa_Pivot", [(1, (12, 0, 16)), (7, (0, 0, 6)), (14, (-2, 0, 26)), (20, (-2, 0, 26)),
                       (27, (-2, 0, -22)), (33, (-2, 0, -22)), (a, (12, 0, 16))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (16, (0, -14, 0)), (29, (0, 14, 0)), (a, (0, 0, 0))])
    for s_ in ("1", "-1"):
        loc(f"Goz_{s_}", [(1, (0.025, 0, -0.025)), (7, (0, 0, 0.01)), (13, (0.035, 0, 0.01)), (20, (0.035, 0, 0.01)),
                          (26, (-0.035, 0, 0.01)), (33, (-0.035, 0, 0.01)), (a, (0.025, 0, -0.025))])
        loc(f"Kas_{s_}", [(1, (0, 0, 0)), (12, (0, 0, 0.02)), (30, (0, 0, 0.02)), (a, (0, 0, 0))])
    blink(23)


_mood_draw_core = mood_draw


def mood_draw():
    _mood_draw_core()
    _add_idle(DRAW_IDLE)


MOODS["draw"] = mood_draw


# ----------------------------------------------------------------------------
# list: Noel Baba'nin uzun listesi (kayit ekrani) - yeni isim eklenir, tik atilir
# ----------------------------------------------------------------------------
LIST_FRAMES = 72
LIST_ROOT_LOC = (0.98, -0.44, 1.22)


def ensure_list():
    if "Liste_Root" in O:
        return O["Liste_Root"]
    import bmesh
    acc = bpy.data.collections["Aksesuarlar"]
    root = bpy.data.objects.new("Liste_Root", None)
    acc.objects.link(root)
    paper = _tm("T_Liste", "#FFF4DD", "#E6D2AE")
    ink = _tm("T_Liste_Yazi", "#8C6A4A", "#6E5034")
    red = _tm("T_Yama", "#B91C1C", "#7A0F14")
    wood = _tm("T_Liste_Ahsap", "#9A6534", "#6E4522")
    gold = _tm("T_Ip_Altin", "#E6B94A", "#B08A2E")
    green = _tm("T_Tik", "#2F8A5A", "#1F5C3E")
    hi = _tm("T_Liste_Vurgu", "#F6D98A", "#E0BC5E")

    W, H = 0.58, 1.08
    me = bpy.data.meshes.new("Liste_Kagit")
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=6, y_segments=24, size=0.5)
    for v in bm.verts:
        x, y = v.co.x, v.co.y
        v.co = (x * W, 0.0, -(y + 0.5) * H)
    bm.to_mesh(me)
    bm.free()
    sheet = bpy.data.objects.new("Liste_Kagit", me)
    bpy.context.scene.collection.objects.link(sheet)
    wav = _texture("Liste_Dalga", 'CLOUDS', 0.25)
    sol = sheet.modifiers.new("Kalinlik", "SOLIDIFY")
    sol.thickness = 0.008
    d = sheet.modifiers.new("Dalga", "DISPLACE")
    d.texture = wav
    d.strength = 0.03
    d.direction = 'Y'
    _part(sheet, acc, paper, root, 0.012)

    def box(name, loc_, scl_, mat, rot_=(0, 0, 0), outline=False, parent=root):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc_, rotation=tuple(R(a) for a in rot_))
        o = bpy.context.object
        o.name = name
        o.scale = scl_
        return _part(o, acc, mat, parent, 0.006, outline)

    # ust ve alt rulo
    for nm, z in (("Liste_Rulo_Ust", 0.0), ("Liste_Rulo_Alt", -H - 0.02)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.045 if z == 0 else 0.07, depth=W + 0.08,
                                            location=(0, -0.0, z), rotation=(0, R(90), 0))
        _part(bpy.context.object, acc, wood if z == 0 else paper, root, 0.012).name = nm
        for sx in (-1, 1):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.05 if z == 0 else 0.075,
                                                 location=(sx * (W / 2 + 0.06), 0, z))
            _part(bpy.context.object, acc, gold, root, 0.01).name = f"{nm}_Uc{sx}"

    y0 = -0.012
    # baslik
    box("Liste_Baslik", (0, y0, -0.11), (0.36, 0.004, 0.06), red)
    for sx in (-1, 1):
        box(f"Liste_BaslikSus{sx}", (sx * 0.23, y0, -0.11), (0.045, 0.004, 0.045), gold, rot_=(0, 45, 0))
    rows = []
    for i in range(7):
        z = -0.24 - i * 0.125
        rows.append(z)
        box(f"Liste_Kutu{i}", (-0.19, y0, z), (0.075, 0.004, 0.075), ink)
        box(f"Liste_KutuIc{i}", (-0.19, y0 - 0.001, z), (0.052, 0.004, 0.052), paper)
        wl = (0.3, 0.24, 0.32, 0.22, 0.3, 0.26, 0.23)[i]
        box(f"Liste_Satir{i}", (-0.13 + wl / 2 + 0.02, y0, z), (wl, 0.004, 0.028), ink)
    # onceden tiklenmisler
    def tick(name, z, mat, sc=1.0):
        t = bpy.data.objects.new(name, None)
        acc.objects.link(t)
        t.parent = root
        t.location = (-0.19, y0 - 0.006, z)
        t.scale = (sc, sc, sc)
        bpy.context.view_layer.update()
        tx, ty, tz = t.location
        box(name + "_a", (tx - 0.018, ty, tz - 0.012), (0.05, 0.006, 0.02), mat, rot_=(0, 45, 0), parent=t)
        box(name + "_b", (tx + 0.024, ty, tz + 0.018), (0.1, 0.006, 0.02), mat, rot_=(0, -55, 0), parent=t)
        return t
    for i in (0, 1, 2):
        tick(f"Liste_Tik{i}", rows[i], green)
    # yeni kayit: vurgulu satir + animasyonlu tik
    box("Liste_Vurgu", (0.02, y0 + 0.002, rows[3]), (0.52, 0.003, 0.1), hi)
    tick("Liste_YeniTik", rows[3], green, sc=1.3)

    root.location = LIST_ROOT_LOC
    return root


def _list_rest():
    r = O.get("Liste_Root")
    if r:
        r.animation_data_clear()
        r.location = LIST_ROOT_LOC
        r.rotation_euler = (0, 0, 0)
        t = O.get("Liste_YeniTik")
        if t:
            t.animation_data_clear()
            t.scale = (1.3, 1.3, 1.3)
        v = O.get("Liste_Vurgu")
        if v:
            v.animation_data_clear()


def mood_list():
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4", "BosCuval", "BosCuval_Agiz", "Cuval_Root"):
        set_visible(g, False)
    if "AcikCuval_Root" in O:
        set_visible("AcikCuval_Root", False)
    root = ensure_list()
    _list_rest()
    set_visible("Liste_Root", True)
    E = LIST_FRAMES + 1

    # liste hafifce sallanir
    for f, rx, ry in ((1, 0, 0), (18, 3, -2), (36, -1, 2), (54, 3, -1), (E, 0, 0)):
        root.rotation_euler = (R(rx), R(ry), 0)
        root.keyframe_insert("rotation_euler", frame=f)
    for f, dz in ((1, 0), (36, 0), (42, 0.06), (50, 0.03), (60, 0), (E, 0)):
        root.location = (LIST_ROOT_LOC[0], LIST_ROOT_LOC[1], LIST_ROOT_LOC[2] + dz)
        root.keyframe_insert("location", frame=f)
    _cycle(root)

    # yeni tik: 30-36 arasi "pop"
    t = O["Liste_YeniTik"]
    for f, sc_ in ((1, 0.01), (28, 0.01), (32, 1.7), (36, 1.3), (62, 1.3), (66, 0.01), (E, 0.01)):
        t.scale = (sc_, sc_, sc_)
        t.keyframe_insert("scale", frame=f)
    _cycle(t)
    v = O["Liste_Vurgu"]
    for f, sx in ((1, 0.01), (20, 0.01), (28, 1.0), (62, 1.0), (68, 0.01), (E, 0.01)):
        v.scale = (0.52 * sx, 0.003, 0.1)
        v.keyframe_insert("scale", frame=f)
    _cycle(v)

    # govde ve kafa: once listeyi okur, tik atilinca kameraya doner
    rot("UstGovde_Pivot", [(1, (0, 4, -4)), (28, (0, 4, -4)), (38, (-3, -1, 0)), (58, (-3, -1, 0)), (E, (0, 4, -4))])
    loc("NoelBaba_Root", [(1, (0, 0, 0)), (36, (0, 0, 0)), (40, (0, 0, 0.08)), (44, (0, 0, 0)), (E, (0, 0, 0))])
    scl("UstGovde_Pivot", [(1, (1, 1, 1)), (36, (1.04, 1.04, 0.95)), (40, (0.98, 0.98, 1.03)), (44, (1.02, 1.02, 0.98)), (50, (1, 1, 1)), (E, (1, 1, 1))])
    rot("Kafa_Pivot", [(1, (8, 0, 20)), (10, (10, 0, 22)), (20, (12, 0, 20)), (28, (10, 0, 22)),
                       (36, (-4, 0, 4)), (42, (-8, 0, 0)), (48, (2, 0, 0)), (54, (-6, 0, 0)), (64, (8, 0, 20)), (E, (8, 0, 20))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (14, (0, 6, 0)), (40, (0, -10, 0)), (52, (0, 4, 0)), (E, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (16, (0, 12, 0)), (42, (0, -22, 0)), (54, (0, 10, 0)), (E, (0, 0, 0))])
    for s_ in ("1", "-1"):
        # satir satir okuma: goz sagdan sola, asagi
        loc(f"Goz_{s_}", [(1, (0.03, 0, 0.0)), (6, (0.045, 0, -0.005)), (10, (0.025, 0, -0.012)), (15, (0.045, 0, -0.016)),
                          (20, (0.025, 0, -0.022)), (25, (0.045, 0, -0.026)), (30, (0.03, 0, -0.02)),
                          (36, (0, 0, 0.01)), (60, (0, 0, 0.01)), (E, (0.03, 0, 0.0))])
        scl(f"Goz_{s_}", [(1, (1, 1, 1)), (34, (1, 1, 1)), (38, (1, 1, 0.4)), (58, (1, 1, 0.4)), (62, (1, 1, 1)), (E, (1, 1, 1))])
        loc(f"Kas_{s_}", [(1, (0, 0, 0.01)), (30, (0, 0, 0.01)), (38, (0, 0, 0.035)), (58, (0, 0, 0.035)), (E, (0, 0, 0.01))])
    scl("Agiz", [(1, (0.7, 1, 0.75)), (12, (0.8, 1, 0.9)), (24, (0.7, 1, 0.75)), (34, (1.25, 1, 1.45)),
                 (58, (1.25, 1, 1.45)), (64, (0.7, 1, 0.75)), (E, (0.7, 1, 0.75))])
    blink(20)

    # sag kol: tik atilinca "tamam!" diye kalkar
    arm("R", [(1, (-0.5, -0.15, -0.85)), (30, (-0.5, -0.15, -0.85)), (38, (-0.62, -0.3, 0.3)),
              (46, (-0.58, -0.3, 0.42)), (54, (-0.62, -0.3, 0.3)), (64, (-0.5, -0.15, -0.85)), (E, (-0.5, -0.15, -0.85))])

    # sol el ust ruloyu tutar (dunya hedefi)
    sc = bpy.context.scene
    pv = O["Kol_Pivot_L"]
    for f in (1, 10, 18, 28, 36, 42, 50, 54, 60, E):
        sc.frame_set(f)
        bpy.context.view_layer.update()
        target = root.matrix_world @ Vector((0.0, 0.0, 0.03))
        pw = pv.matrix_world.translation.copy()
        par = (pv.parent.matrix_world @ pv.matrix_parent_inverse).to_3x3()
        dw = target - pw
        pv.rotation_quaternion = arm_q(par.inverted() @ dw)
        pv.keyframe_insert("rotation_quaternion", frame=f)
        pv.scale = (1, 1, max(0.85, dw.length / (HAND_REACH * par.to_scale().z)))
        pv.keyframe_insert("scale", frame=f)
    sc.frame_set(1)

    O["Kamera"].location = (0.12, -10, 3.2)
    O["Kamera_Hedef"].location = (0.12, 0, 1.5)


MOODS["list"] = mood_list


_reset_draw_extras_prev = _reset_draw_extras


def _reset_draw_extras():
    _reset_draw_extras_prev()
    if "Liste_Root" in O:
        _list_rest()
        set_visible("Liste_Root", False)


# ----------------------------------------------------------------------------
# watch: cep saatine bakar, kameraya "az kaldi!" der (cekilislerim ekrani)
# ----------------------------------------------------------------------------
WATCH_ROOT_LOC = (1.0, -0.5, 0.86)
WATCH_SCALE = 1.7


def ensure_watch():
    if "Saat_Root" in O:
        return O["Saat_Root"]
    acc = bpy.data.collections["Aksesuarlar"]
    root = bpy.data.objects.new("Saat_Root", None)
    acc.objects.link(root)
    gold = _tm("T_Ip_Altin", "#E6B94A", "#B08A2E")
    face = _tm("T_Saat_Yuz", "#FFF8EA", "#E8D8BC")
    ink = _tm("T_Saat_Ibre", "#3A2626", "#2A1C1C")
    red = _tm("T_Yama", "#B91C1C", "#7A0F14")
    R_ = 0.17
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=R_, depth=0.06, location=(0, 0, 0), rotation=(R(90), 0, 0))
    _part(bpy.context.object, acc, gold, root, 0.014).name = "Saat_Kasa"
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=R_ * 0.82, depth=0.01, location=(0, -0.031, 0), rotation=(R(90), 0, 0))
    _part(bpy.context.object, acc, face, root, outline=False).name = "Saat_Yuz"
    for i in range(12):
        a = i / 12 * math.tau
        big = i % 3 == 0
        bpy.ops.mesh.primitive_cube_add(size=1, location=(math.sin(a) * R_ * 0.68, -0.038, math.cos(a) * R_ * 0.68),
                                        rotation=(0, -a, 0))
        o = bpy.context.object
        o.scale = (0.012 if big else 0.007, 0.004, 0.035 if big else 0.02)
        _part(o, acc, red if big else ink, root, outline=False).name = f"Saat_Cizgi{i}"
    # ibreler (kendi pivotlarinda)
    for nm, L, w in (("Saat_Akrep", 0.07, 0.016), ("Saat_Yelkovan", 0.11, 0.011)):
        piv = bpy.data.objects.new(nm, None)
        acc.objects.link(piv)
        piv.parent = root
        piv.location = (0, -0.044, 0)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.044, L / 2))
        h = bpy.context.object
        h.scale = (w, 0.004, L)
        _part(h, acc, ink, piv, outline=False).name = nm + "_Mesh"
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.018, location=(0, -0.048, 0))
    _part(bpy.context.object, acc, red, root, outline=False).name = "Saat_Merkez"
    # kurma tepesi + halka
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.03, depth=0.05, location=(0, 0, R_ + 0.03))
    _part(bpy.context.object, acc, gold, root, 0.01).name = "Saat_Tepe"
    bpy.ops.mesh.primitive_torus_add(major_radius=0.04, minor_radius=0.011, location=(0, 0, R_ + 0.08), rotation=(R(90), 0, 0))
    _part(bpy.context.object, acc, gold, root, 0.008).name = "Saat_Halka"
    # zincir: halkadan asagi sarkan halkalar
    for i in range(7):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.022, minor_radius=0.007,
                                         location=(0.02 + i * 0.012, -0.01, R_ + 0.08 - 0.04 - i * 0.045),
                                         rotation=(R(90), R(90 * (i % 2)), 0))
        _part(bpy.context.object, acc, gold, root, outline=False).name = f"Saat_Zincir{i}"
    root.location = WATCH_ROOT_LOC
    root.scale = (WATCH_SCALE,) * 3
    return root


def _watch_rest():
    r = O.get("Saat_Root")
    if r:
        r.animation_data_clear()
        r.location = WATCH_ROOT_LOC
        r.rotation_euler = (0, 0, 0)
        r.scale = (WATCH_SCALE,) * 3
        for nm in ("Saat_Akrep", "Saat_Yelkovan"):
            o = O.get(nm)
            if o:
                o.animation_data_clear()
                o.rotation_euler = (0, 0, 0)


def mood_watch():
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4", "BosCuval", "BosCuval_Agiz", "Cuval_Root"):
        set_visible(g, False)
    for g in ("AcikCuval_Root", "Liste_Root", "Kagit"):
        if g in O:
            set_visible(g, False)
    root = ensure_watch()
    _watch_rest()
    set_visible("Saat_Root", True)
    E = 73

    # saat sallanir, kameraya gosterilirken one gelir
    for f, loc_, rot_ in ((1, (0, 0, 0), (0, 4, -18)), (12, (0, 0, 0.01), (2, -4, -22)), (24, (0, 0, 0), (0, 4, -18)),
                          (34, (-0.06, -0.08, 0.06), (0, 0, 0)), (50, (-0.06, -0.08, 0.06), (0, 0, 0)),
                          (60, (0, 0, 0), (0, 4, -18)), (E, (0, 0, 0), (0, 4, -18))):
        root.location = Vector(WATCH_ROOT_LOC) + Vector(loc_)
        root.rotation_euler = tuple(R(a) for a in rot_)
        root.keyframe_insert("location", frame=f)
        root.keyframe_insert("rotation_euler", frame=f)
    _cycle(root)
    for nm, turns in (("Saat_Yelkovan", 1), ("Saat_Akrep", 0)):
        o = O[nm]
        o.rotation_euler = (0, R(-40 if turns == 0 else 0), 0)
        o.keyframe_insert("rotation_euler", frame=1)
        o.rotation_euler = (0, R(-40 if turns == 0 else 0) + (-math.tau * turns if turns else R(-30)), 0)
        o.keyframe_insert("rotation_euler", frame=E)
        ad = o.animation_data
        from bpy_extras import anim_utils
        cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
        for fc in cb.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'
            fc.modifiers.new('CYCLES')

    rot("UstGovde_Pivot", [(1, (0, 4, -4)), (24, (0, 4, -4)), (34, (-3, -1, 0)), (50, (-3, -1, 0)), (60, (0, 4, -4)), (E, (0, 4, -4))])
    loc("NoelBaba_Root", [(1, (0, 0, 0)), (34, (0, 0, 0)), (38, (0, 0, 0.07)), (42, (0, 0, 0)), (46, (0, 0, 0.05)), (50, (0, 0, 0)), (E, (0, 0, 0))])
    rot("Kafa_Pivot", [(1, (4, 0, 22)), (8, (6, 0, 26)), (16, (2, 0, 24)), (24, (4, 0, 22)),
                       (32, (-4, 0, 4)), (38, (-8, 0, 0)), (44, (0, 0, 0)), (50, (-6, 0, 0)), (60, (4, 0, 22)), (E, (4, 0, 22))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (14, (0, 6, 0)), (38, (0, -10, 0)), (50, (0, 4, 0)), (E, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (16, (0, 14, 0)), (40, (0, -22, 0)), (52, (0, 10, 0)), (E, (0, 0, 0))])
    for s_ in ("1", "-1"):
        loc(f"Goz_{s_}", [(1, (0.04, 0, 0.01)), (24, (0.04, 0, 0.01)), (32, (0, 0, 0.01)), (52, (0, 0, 0.01)), (60, (0.04, 0, 0.01)), (E, (0.04, 0, 0.01))])
        scl(f"Goz_{s_}", [(1, (1, 1, 1)), (16, (1.1, 1, 1.15)), (24, (1, 1, 1)), (34, (1, 1, 0.4)), (52, (1, 1, 0.4)), (58, (1, 1, 1)), (E, (1, 1, 1))])
        loc(f"Kas_{s_}", [(1, (0, 0, 0.01)), (14, (0, 0, 0.045)), (24, (0, 0, 0.01)), (34, (0, 0, 0.03)), (52, (0, 0, 0.03)), (E, (0, 0, 0.01))])
    scl("Agiz", [(1, (0.7, 1, 0.8)), (14, (0.55, 1, 1.0)), (24, (0.7, 1, 0.8)), (32, (1.25, 1, 1.45)), (52, (1.25, 1, 1.45)), (60, (0.7, 1, 0.8)), (E, (0.7, 1, 0.8))])
    blink(22)
    # sag el: "acele et!" diye sallar
    def wdir(deg):
        a = R(deg)
        return (-math.sin(a), -0.18, -math.cos(a))
    arm("R", [(1, (-0.5, -0.15, -0.85)), (28, (-0.5, -0.15, -0.85)), (34, wdir(150)), (38, wdir(125)), (42, wdir(155)),
              (46, wdir(125)), (50, wdir(150)), (58, (-0.5, -0.15, -0.85)), (E, (-0.5, -0.15, -0.85))])

    sc = bpy.context.scene
    pv = O["Kol_Pivot_L"]
    for f in (1, 12, 24, 30, 34, 42, 50, 56, 60, E):
        sc.frame_set(f)
        bpy.context.view_layer.update()
        target = root.matrix_world @ Vector((0.0, 0.0, 0.25))
        pw = pv.matrix_world.translation.copy()
        par = (pv.parent.matrix_world @ pv.matrix_parent_inverse).to_3x3()
        dw = target - pw
        pv.rotation_quaternion = arm_q(par.inverted() @ dw)
        pv.keyframe_insert("rotation_quaternion", frame=f)
        pv.scale = (1, 1, max(0.85, dw.length / (HAND_REACH * par.to_scale().z)))
        pv.keyframe_insert("scale", frame=f)
    sc.frame_set(1)
    O["Kamera"].location = (0.12, -10, 3.2)
    O["Kamera_Hedef"].location = (0.12, 0, 1.5)


MOODS["watch"] = mood_watch

_reset_prev2 = _reset_draw_extras


def _reset_draw_extras():
    _reset_prev2()
    if "Saat_Root" in O:
        _watch_rest()
        set_visible("Saat_Root", False)


# ----------------------------------------------------------------------------
# cover: sifre yazilirken elleriyle gozlerini kapatir, arada aralayip bakar
# ----------------------------------------------------------------------------
def mood_cover():
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4", "BosCuval", "BosCuval_Agiz", "Cuval_Root"):
        set_visible(g, False)
    for g in ("AcikCuval_Root", "Liste_Root", "Kagit", "Saat_Root"):
        if g in O:
            set_visible(g, False)
    E = 73
    # omuzlar yukari/ice: kollar sakalin arkasindan yuzune uzanir
    loc("Kol_Pivot_L", [(1, (-0.14, -0.22, 0.26))])
    loc("Kol_Pivot_R", [(1, (0.14, -0.22, 0.26))])
    rot("Kafa_Pivot", [(1, (10, 0, 0)), (12, (10, 0, 4)), (24, (10, 0, -4)), (30, (8, 0, 0)), (36, (4, 0, 10)),
                       (46, (4, 0, 10)), (52, (10, 0, 0)), (62, (10, 0, 4)), (E, (10, 0, 0))])
    rot("UstGovde_Pivot", [(1, (4, 0, 0)), (6, (4, 3, 0)), (12, (4, -3, 0)), (18, (4, 3, 0)), (24, (4, 0, 0)),
                           (52, (4, 0, 0)), (58, (4, 3, 0)), (64, (4, -3, 0)), (E, (4, 0, 0))])
    scl("UstGovde_Pivot", [(1, (1, 1, 1)), (6, (1.02, 1.02, 0.97)), (12, (1, 1, 1)), (18, (1.02, 1.02, 0.97)), (24, (1, 1, 1)), (E, (1, 1, 1))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (8, (0, 6, 0)), (16, (0, -6, 0)), (24, (0, 0, 0)), (40, (0, -6, 0)), (E, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (10, (0, 14, 0)), (18, (0, -12, 0)), (26, (0, 0, 0)), (42, (0, -16, 0)), (E, (0, 0, 0))])
    scl("Agiz", [(1, (1.15, 1, 1.25)), (10, (1.25, 1, 1.4)), (20, (1.15, 1, 1.25)), (36, (0.7, 1, 0.9)), (46, (0.7, 1, 0.9)), (52, (1.15, 1, 1.25)), (E, (1.15, 1, 1.25))])
    for s_ in ("1", "-1"):
        loc(f"Goz_{s_}", [(1, (0, 0, 0)), (34, (0, 0, 0)), (38, (0.03, 0, -0.01)), (46, (0.03, 0, -0.01)), (50, (0, 0, 0)), (E, (0, 0, 0))])
    blink(62)

    sc = bpy.context.scene

    def hand_to(side, f, eye_name, off):
        pv = O[f"Kol_Pivot_{side}"]
        sc.frame_set(f)
        bpy.context.view_layer.update()
        target = O[eye_name].matrix_world.translation + Vector(off)
        pw = pv.matrix_world.translation.copy()
        par = (pv.parent.matrix_world @ pv.matrix_parent_inverse).to_3x3()
        dw = target - pw
        pv.rotation_quaternion = arm_q(par.inverted() @ dw)
        pv.keyframe_insert("rotation_quaternion", frame=f)
        pv.scale = (1, 1, max(0.85, dw.length / (HAND_REACH * par.to_scale().z)))
        pv.keyframe_insert("scale", frame=f)

    cover = (0.0, -0.16, -0.02)
    for f in (1, 6, 12, 18, 24, 30, 52, 58, 64, E):
        wig = 0.012 if f in (6, 18, 58) else (-0.012 if f in (12, 64) else 0)
        hand_to("R", f, "Goz_-1", (cover[0] - 0.02, cover[1], cover[2] + wig))
    for f, off in ((1, (0.02, -0.16, -0.02)), (6, (0.02, -0.16, -0.008)), (12, (0.02, -0.16, -0.032)), (18, (0.02, -0.16, -0.008)),
                   (24, (0.02, -0.16, -0.02)), (30, (0.02, -0.16, -0.02)), (36, (0.26, -0.12, -0.3)), (46, (0.26, -0.12, -0.3)),
                   (52, (0.02, -0.16, -0.02)), (58, (0.02, -0.16, -0.008)), (64, (0.02, -0.16, -0.032)), (E, (0.02, -0.16, -0.02))):
        hand_to("L", f, "Goz_1", off)
    sc.frame_set(1)


MOODS["cover"] = mood_cover


# ----------------------------------------------------------------------------
# invite: elinde muhurlu davet zarfi, icinden altin bilet cikar (kodla katil)
# ----------------------------------------------------------------------------
INVITE_ROOT_LOC = (1.2, -0.55, 1.08)
INVITE_SCALE = 1.55


def ensure_invite():
    if "Zarf_Root" in O:
        return O["Zarf_Root"]
    import bmesh
    acc = bpy.data.collections["Aksesuarlar"]
    root = bpy.data.objects.new("Zarf_Root", None)
    acc.objects.link(root)
    red = _tm("T_Zarf_Krem", "#FFF4DD", "#E6D2AE")
    red_d = _tm("T_Zarf_KremKapak", "#F0DDBA", "#D2B98C")
    gold = _tm("T_Yama", "#B91C1C", "#7A0F14")
    ticket = _tm("T_Bilet", "#F6D98A", "#D9B45A")
    ink = _tm("T_Bilet_Yazi", "#8C1A1F", "#6E0D12")
    W, H = 0.46, 0.32
    # bilet (zarfin arkasinda, yukari kayar)
    tk = bpy.data.objects.new("Zarf_Bilet", None)
    acc.objects.link(tk)
    tk.parent = root
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.004, 0))
    b = bpy.context.object
    b.scale = (W * 0.84, 0.012, H * 0.86)
    bv = b.modifiers.new("Bevel", "BEVEL"); bv.width = 0.02; bv.segments = 2
    _part(b, acc, ticket, tk, 0.01).name = "Zarf_BiletKart"
    for i, (w, z) in enumerate(((0.22, 0.07), (0.16, 0.02))):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.004, z))
        ln = bpy.context.object
        ln.scale = (w, 0.004, 0.022)
        _part(ln, acc, ink, tk, outline=False).name = f"Zarf_BiletYazi{i}"
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.025, depth=0.03, location=(sx * W * 0.42, 0.0, 0.04), rotation=(R(90), 0, 0))
        _part(bpy.context.object, acc, _tm("T_Yama", "#B91C1C", "#7A0F14"), tk, outline=False).name = f"Zarf_BiletDelik{sx}"
    # zarf govdesi
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.02, 0))
    body = bpy.context.object
    body.scale = (W, 0.03, H)
    bvb = body.modifiers.new("Bevel", "BEVEL"); bvb.width = 0.02; bvb.segments = 2
    _part(body, acc, red, root, 0.014).name = "Zarf_Govde"
    # on yuz: alt V cizgileri
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * W * 0.25, -0.037, -H * 0.18), rotation=(0, R(-sx * 34), 0))
        ln = bpy.context.object
        ln.scale = (W * 0.6, 0.004, 0.012)
        _part(ln, acc, red_d, root, outline=False).name = f"Zarf_Cizgi{sx}"
    # kapak (ucgen)
    me = bpy.data.meshes.new("Zarf_Kapak")
    bm = bmesh.new()
    v = [bm.verts.new(c) for c in ((-W / 2, 0, H / 2), (W / 2, 0, H / 2), (0, 0, -H * 0.12))]
    f = bm.faces.new(v)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, verts=[x for x in ext["geom"] if isinstance(x, bmesh.types.BMVert)], vec=(0, -0.012, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    flap = bpy.data.objects.new("Zarf_Kapak", me)
    bpy.context.scene.collection.objects.link(flap)
    flap.location = (0, -0.038, 0)
    _part(flap, acc, red_d, root, 0.012)
    # altin muhur
    bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=0.06, depth=0.02, location=(0, -0.056, -H * 0.1), rotation=(R(90), 0, 0))
    _part(bpy.context.object, acc, gold, root, 0.01).name = "Zarf_Muhur"
    bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=0.035, depth=0.01, location=(0, -0.068, -H * 0.1), rotation=(R(90), 0, 0))
    _part(bpy.context.object, acc, _tm("T_Ip_Altin", "#E6B94A", "#B08A2E"), root, outline=False).name = "Zarf_MuhurIc"
    root.location = INVITE_ROOT_LOC
    root.scale = (INVITE_SCALE,) * 3
    return root


def _invite_rest():
    r = O.get("Zarf_Root")
    if r:
        r.animation_data_clear()
        r.location = INVITE_ROOT_LOC
        r.rotation_euler = (0, 0, 0)
        r.scale = (INVITE_SCALE,) * 3
        t = O.get("Zarf_Bilet")
        if t:
            t.animation_data_clear()
            t.location = (0, 0, 0)


def mood_invite():
    for g in ("Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4", "BosCuval", "BosCuval_Agiz", "Cuval_Root"):
        set_visible(g, False)
    for g in ("AcikCuval_Root", "Liste_Root", "Kagit", "Saat_Root"):
        if g in O:
            set_visible(g, False)
    root = ensure_invite()
    _invite_rest()
    set_visible("Zarf_Root", True)
    E = 73
    for f, dl, rr in \
            ((1, (0, 0, 0), (0, 4, -4)), (14, (0, 0, 0.01), (0, -3, -6)), (26, (0, 0, 0), (0, 4, -4)),
             (36, (-0.06, -0.1, 0.08), (0, 3, 0)), (42, (-0.06, -0.1, 0.1), (0, -5, 0)), (48, (-0.06, -0.1, 0.08), (0, 4, 0)),
             (54, (-0.06, -0.1, 0.08), (0, 0, 0)), (64, (0, 0, 0), (0, 4, -4)), (E, (0, 0, 0), (0, 4, -4))):
        root.location = Vector(INVITE_ROOT_LOC) + Vector(dl)
        root.rotation_euler = tuple(R(a) for a in rr)
        root.keyframe_insert("location", frame=f)
        root.keyframe_insert("rotation_euler", frame=f)
    _cycle(root)
    t = O["Zarf_Bilet"]
    for f, z in ((1, 0), (18, 0), (28, 0.2), (56, 0.2), (64, 0), (E, 0)):
        t.location = (0, 0, z)
        t.keyframe_insert("location", frame=f)
    _cycle(t)

    rot("UstGovde_Pivot", [(1, (0, 4, -4)), (26, (0, 4, -4)), (36, (-3, -1, 0)), (54, (-3, -1, 0)), (64, (0, 4, -4)), (E, (0, 4, -4))])
    loc("NoelBaba_Root", [(1, (0, 0, 0)), (32, (0, 0, 0)), (36, (0, 0, 0.07)), (40, (0, 0, 0)), (E, (0, 0, 0))])
    rot("Kafa_Pivot", [(1, (4, 0, 22)), (12, (6, 0, 26)), (24, (2, 0, 24)), (32, (-4, 0, 6)), (38, (-8, 0, 0)),
                       (46, (-6, 0, 4)), (54, (-8, 0, 0)), (64, (4, 0, 22)), (E, (4, 0, 22))])
    rot("Sapka_Pivot", [(1, (0, 0, 0)), (14, (0, 6, 0)), (38, (0, -10, 0)), (52, (0, 4, 0)), (E, (0, 0, 0))])
    rot("Sapka_Uc_Pivot", [(1, (0, 0, 0)), (16, (0, 14, 0)), (40, (0, -22, 0)), (52, (0, 10, 0)), (E, (0, 0, 0))])
    for s_ in ("1", "-1"):
        loc(f"Goz_{s_}", [(1, (0.04, 0, 0.0)), (26, (0.04, 0, 0.01)), (32, (0, 0, 0.01)), (56, (0, 0, 0.01)), (64, (0.04, 0, 0.0)), (E, (0.04, 0, 0.0))])
        scl(f"Goz_{s_}", [(1, (1, 1, 1)), (22, (1.1, 1, 1.15)), (30, (1, 1, 1)), (36, (1, 1, 0.4)), (54, (1, 1, 0.4)), (60, (1, 1, 1)), (E, (1, 1, 1))])
        loc(f"Kas_{s_}", [(1, (0, 0, 0.01)), (22, (0, 0, 0.045)), (30, (0, 0, 0.02)), (54, (0, 0, 0.03)), (E, (0, 0, 0.01))])
    scl("Agiz", [(1, (0.8, 1, 0.85)), (22, (0.6, 1, 1.05)), (30, (1.25, 1, 1.45)), (56, (1.25, 1, 1.45)), (64, (0.8, 1, 0.85)), (E, (0.8, 1, 0.85))])
    blink(8)
    arm("R", [(1, (-0.5, -0.15, -0.85)), (32, (-0.5, -0.15, -0.85)), (38, (-0.62, -0.3, 0.3)), (46, (-0.58, -0.3, 0.42)),
              (54, (-0.62, -0.3, 0.3)), (62, (-0.5, -0.15, -0.85)), (E, (-0.5, -0.15, -0.85))])

    sc = bpy.context.scene
    pv = O["Kol_Pivot_L"]
    for f in (1, 14, 26, 32, 36, 42, 48, 54, 60, 64, E):
        sc.frame_set(f)
        bpy.context.view_layer.update()
        target = root.matrix_world @ Vector((-0.21, -0.03, -0.06))
        pw = pv.matrix_world.translation.copy()
        par = (pv.parent.matrix_world @ pv.matrix_parent_inverse).to_3x3()
        dw = target - pw
        pv.rotation_quaternion = arm_q(par.inverted() @ dw)
        pv.keyframe_insert("rotation_quaternion", frame=f)
        pv.scale = (1, 1, max(0.85, dw.length / (HAND_REACH * par.to_scale().z)))
        pv.keyframe_insert("scale", frame=f)
    sc.frame_set(1)
    O["Kamera"].location = (0.2, -10, 3.2)
    O["Kamera_Hedef"].location = (0.2, 0, 1.5)


MOODS["invite"] = mood_invite

_reset_prev3 = _reset_draw_extras


def _reset_draw_extras():
    _reset_prev3()
    if "Zarf_Root" in O:
        _invite_rest()
        set_visible("Zarf_Root", False)
