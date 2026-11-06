"""
Lets Raffle - Noel Baba karakter modeli (cizgi film / toon stili).

Blender icinde:
    exec(open(".../art/build_character.py").read())
    build_character()     # NoelBaba koleksiyonunu sifirdan kurar

Stil: cel-shading (Shader to RGB, iki ton) + inverted-hull siyah kontur.
Yalnizca EEVEE ile dogru gorunur.
"""
import bpy
import bmesh
import math
from mathutils import Vector

R = math.radians

# Character proportions shared with build_santa.py
SHOULDER = (0.6, 0.0, 1.05)
ARM_LEN = 0.53
UPPER_PIVOT_Z = 0.45
HEAD_PIVOT_Z = 1.3

OUTLINE_W = 0.022


# ----------------------------------------------------------------------------
# materials
# ----------------------------------------------------------------------------
def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexcol(h):
    h = h.lstrip("#")
    return tuple(_lin(int(h[i:i + 2], 16)) for i in (0, 2, 4))


def toon_mat(name, base, shadow=None, threshold=0.32, linear=False):
    """Two-tone cel material. base/shadow: hex strings (or linear tuples if linear=True)."""
    b = base if linear else hexcol(base)
    if shadow is None:
        s = tuple(x * 0.62 for x in b)
    else:
        s = shadow if linear else hexcol(shadow)
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse")
    s2r = nt.nodes.new("ShaderNodeShaderToRGB")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    emi = nt.nodes.new("ShaderNodeEmission")
    ramp.color_ramp.interpolation = 'CONSTANT'
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, (*s, 1)
    e[1].position, e[1].color = threshold, (*b, 1)
    nt.links.new(dif.outputs[0], s2r.inputs[0])
    nt.links.new(s2r.outputs["Color"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], emi.inputs["Color"])
    nt.links.new(emi.outputs[0], out.inputs["Surface"])
    m.diffuse_color = (*b, 1)
    m["toon"] = True
    return m


def outline_mat():
    m = bpy.data.materials.get("Kontur")
    if m:
        return m
    m = bpy.data.materials.new("Kontur")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    emi = nt.nodes.new("ShaderNodeEmission")
    emi.inputs["Color"].default_value = (*hexcol("#2a1c1c"), 1)
    nt.links.new(emi.outputs[0], out.inputs["Surface"])
    m.use_backface_culling = True
    try:
        m.use_backface_culling_shadow = True
    except Exception:
        pass
    m.diffuse_color = (0.02, 0.015, 0.015, 1)
    return m


def add_outline(o, width=OUTLINE_W):
    if o.type != 'MESH' or any(md.name == "Kontur" for md in o.modifiers):
        return
    om = outline_mat()
    idx = len(o.data.materials)
    o.data.materials.append(om)
    sd = o.modifiers.new("Kontur", "SOLIDIFY")
    sd.thickness = width
    sd.offset = 1.0
    sd.use_flip_normals = True
    sd.use_rim = False
    sd.material_offset = idx
    sd.use_even_offset = False


def convert_material_to_toon(m):
    """Convert an existing Principled material in place to toon, keeping its base colour."""
    if m.get("toon") or m.name == "Kontur" or not m.use_nodes:
        return
    p = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not p:
        return
    col = tuple(p.inputs["Base Color"].default_value)[:3]
    toon_mat(m.name, col, linear=True)


PAL = {}


def palette():
    PAL.update({
        "red": toon_mat("T_Kirmizi", "#e5453c", "#b8302c"),
        "fur": toon_mat("T_Kurk", "#f7f4f0", "#d9d3cc"),
        "beard": toon_mat("T_Sakal", "#eef2f6", "#c5d0db"),
        "skin": toon_mat("T_Ten", "#f6d2ae", "#e2b48c"),
        "cheek": toon_mat("T_Yanak", "#f4a8a4", "#e88f8c"),
        "nose": toon_mat("T_Burun", "#f3a39d", "#dd8580"),
        "eye": toon_mat("T_Goz", "#1d1717", "#1d1717"),
        "white": toon_mat("T_Beyaz", "#ffffff", "#ffffff"),
        "brow": toon_mat("T_Kas", "#a4adb8", "#8a93a0"),
        "mouth": toon_mat("T_Agiz", "#b8322c", "#9c2a25"),
        "tongue": toon_mat("T_Dil", "#ef7a70", "#e06a62"),
        "belt": toon_mat("T_Kemer", "#2f2b2b", "#221f1f"),
        "gold": toon_mat("T_Altin", "#f2c230", "#d39a1c"),
        "boot": toon_mat("T_Bot", "#3b3838", "#2a2727"),
    })


# ----------------------------------------------------------------------------
# geometry helpers
# ----------------------------------------------------------------------------
_COLL = None


def _finish(o, mat, parent=None, outline=True, smooth=True, apply_scale=True, width=OUTLINE_W):
    for uc in o.users_collection:
        uc.objects.unlink(o)
    _COLL.objects.link(o)
    if apply_scale and o.type == 'MESH':
        scl = o.scale.copy()
        o.data.transform(__import__("mathutils").Matrix.Diagonal((*scl, 1)))
        o.scale = (1, 1, 1)
        o.data.update()
    if mat and o.type == 'MESH':
        o.data.materials.append(mat)
    if smooth and o.type == 'MESH':
        for p in o.data.polygons:
            p.use_smooth = True
    if outline:
        add_outline(o, width)
    if parent:
        bpy.context.view_layer.update()
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o


def sphere(name, loc, r, scale=(1, 1, 1), mat=None, parent=None, rot=(0, 0, 0), outline=True, seg=48, **kw):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc,
                                         rotation=tuple(R(a) for a in rot))
    o = bpy.context.object
    o.name = name
    o.scale = scale
    return _finish(o, mat, parent, outline, **kw)


def cyl(name, loc, r, depth, mat=None, parent=None, rot=(0, 0, 0), outline=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=depth, location=loc,
                                        rotation=tuple(R(a) for a in rot))
    o = bpy.context.object
    o.name = name
    return _finish(o, mat, parent, outline)


def torus(name, loc, R_, r, mat=None, parent=None, scale=(1, 1, 1), rot=(0, 0, 0), outline=True):
    bpy.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=24, major_radius=R_, minor_radius=r,
                                     location=loc, rotation=tuple(R(a) for a in rot))
    o = bpy.context.object
    o.name = name
    o.scale = scale
    return _finish(o, mat, parent, outline)


def rbox(name, loc, size, bevel, mat=None, parent=None, outline=True):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    _finish(o, mat, None, False, smooth=False)
    bv = o.modifiers.new("Bevel", "BEVEL")
    bv.width = bevel
    bv.segments = 4
    bv.limit_method = 'NONE'
    for p in o.data.polygons:
        p.use_smooth = True
    if outline:
        add_outline(o)
    if parent:
        bpy.context.view_layer.update()
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o


def empty(name, loc, parent=None, size=0.15):
    o = bpy.data.objects.new(name, None)
    o.location = loc
    o.empty_display_size = size
    _COLL.objects.link(o)
    if parent:
        bpy.context.view_layer.update()
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o


def hat_tube(name, p0, p1, p2, r0, r1, rings=28, seg=40):
    """Tapered tube along a quadratic bezier -> floppy Santa hat."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    P0, P1, P2 = Vector(p0), Vector(p1), Vector(p2)
    prev = None
    ring_list = []
    for i in range(rings + 1):
        t = i / rings
        pt = (1 - t) ** 2 * P0 + 2 * (1 - t) * t * P1 + t ** 2 * P2
        tan = (2 * (1 - t) * (P1 - P0) + 2 * t * (P2 - P1)).normalized()
        # radius: soft taper with a slight belly
        rad = r1 + (r0 - r1) * (1 - t) ** 1.15 * (1 + 0.12 * math.sin(math.pi * t))
        side = Vector((0, 1, 0)).cross(tan).normalized()
        up = tan.cross(side).normalized()
        ring = []
        for k in range(seg):
            a = 2 * math.pi * k / seg
            ring.append(bm.verts.new(pt + rad * (math.cos(a) * side + math.sin(a) * up)))
        ring_list.append(ring)
    for i in range(rings):
        a, b = ring_list[i], ring_list[i + 1]
        for k in range(seg):
            bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
    bm.faces.new(list(reversed(ring_list[0])))
    bm.faces.new(ring_list[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o


# ----------------------------------------------------------------------------
# build
# ----------------------------------------------------------------------------
def clear_character():
    names = [o.name for o in bpy.data.collections["NoelBaba"].objects]
    names += [n for n in ("BosCuval", "BosCuval_Agiz") if n in bpy.data.objects]
    for n in names:
        o = bpy.data.objects.get(n)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials):
        for d in list(coll):
            if d.users == 0:
                coll.remove(d)


def _tex(name, kind, scale, **kw):
    t = bpy.data.textures.get(name) or bpy.data.textures.new(name, kind)
    t.noise_scale = scale
    for k, v in kw.items():
        setattr(t, k, v)
    return t


def displace(o, tex, strength, mid=0.5, coords='LOCAL'):
    d = o.modifiers.new(f"Disp_{tex.name}", "DISPLACE")
    d.texture = tex
    d.strength = strength
    d.mid_level = mid
    d.texture_coords = coords
    return d


def blob(name, prims, voxel=0.014, smooth_iter=8, grooves=0.0, groove_scale=0.045):
    """prims: list of (kind, loc, radius, scale, rot_deg). Merged with voxel remesh -> one soft shape."""
    parts = []
    for kind, loc, r, scl, rot in prims:
        if kind == "s":
            bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r, location=loc,
                                                 rotation=tuple(R(a) for a in rot))
        else:  # cone, r = (r1, r2, depth)
            bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=r[0], radius2=r[1], depth=r[2], location=loc,
                                            rotation=tuple(R(a) for a in rot))
        o = bpy.context.object
        o.scale = scl
        parts.append(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if len(parts) > 1:
        bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    rm = o.modifiers.new("Remesh", "REMESH")
    rm.mode = 'VOXEL'
    rm.voxel_size = voxel
    if smooth_iter:
        sm = o.modifiers.new("Smooth", "SMOOTH")
        sm.factor = 1.0
        sm.iterations = smooth_iter
    if grooves:
        t = _tex("Tel_Doku", 'WOOD', groove_scale, wood_type='BANDS', noise_basis_2='SIN')
        displace(o, t, grooves)
        sm2 = o.modifiers.new("Smooth2", "SMOOTH")
        sm2.factor = 0.5
        sm2.iterations = 2
    return o


def fur(o, strength=0.028, scale=0.06):
    """plush fur bumps"""
    t = _tex(f"Kurk_Doku_{int(scale*1000)}", 'VORONOI', scale)
    t.distance_metric = 'DISTANCE'
    displace(o, t, strength)
    return o


def build_character():
    global _COLL
    clear_character()
    _COLL = bpy.data.collections["NoelBaba"]
    palette()
    P = PAL
    P["sole"] = toon_mat("T_Taban", "#262323", "#1a1818")
    P["eyebrow"] = toon_mat("T_Kas", "#b9c1cb", "#959fac")

    root = empty("NoelBaba_Root", (0, 0, 0), size=0.8)
    root.empty_display_type = 'CIRCLE'
    upper = empty("UstGovde_Pivot", (0, 0, UPPER_PIVOT_Z), root)

    # ---------------------------------------------------------------- legs & boots
    for s, side in ((1, "L"), (-1, "R")):
        x = 0.27 * s
        cyl(f"Bacak_{side}", (x, 0, 0.31), 0.15, 0.3, P["red"], root)
        cuff = torus(f"Bot_Kurk_{side}", (x, -0.01, 0.22), 0.155, 0.058, P["fur"], root)
        fur(cuff, 0.018, 0.035)
        sphere(f"Bot_{side}", (x + 0.01 * s, -0.08, 0.11), 0.2, (1.1, 1.42, 0.6), P["boot"], root)
        sphere(f"Bot_Taban_{side}", (x + 0.01 * s, -0.08, 0.05), 0.205, (1.14, 1.46, 0.28), P["sole"], root)

    # ---------------------------------------------------------------- body
    sphere("Govde", (0, 0, 0.74), 0.64, (1.08, 0.86, 0.8), P["red"], upper, seg=64)
    hem = torus("Etek_Kurk", (0, 0, 0.4), 0.52, 0.12, P["fur"], upper, scale=(1.04, 0.88, 1))
    fur(hem, 0.03, 0.06)
    torus("Kemer", (0, 0, 0.74), 0.67, 0.07, P["belt"], upper, scale=(1.03, 0.85, 1.7))
    # buckle: frame with a real hole + prong
    buckle = rbox("Kemer_Toka", (0, -0.585, 0.74), (0.38, 0.08, 0.3), 0.045, P["gold"], upper)
    old = bpy.data.objects.get("Toka_Kesici")
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.585, 0.74))
    cutter = bpy.context.object
    cutter.scale = (0.2, 0.3, 0.14)
    bo = buckle.modifiers.new("Delik", "BOOLEAN")
    bo.operation = 'DIFFERENCE'
    bo.object = cutter
    bo.solver = 'EXACT'
    # keep the boolean before bevel/outline
    buckle.modifiers.move(buckle.modifiers.find("Delik"), 0)
    cutter.hide_viewport = cutter.hide_render = True
    cutter.name = "Toka_Kesici"
    for uc in cutter.users_collection:
        uc.objects.unlink(cutter)
    bpy.data.collections["Sahne"].objects.link(cutter)
    cyl("Toka_Dil", (-0.03, -0.62, 0.74), 0.016, 0.16, P["gold"], upper, rot=(0, 90, 0))

    # ---------------------------------------------------------------- arms
    sx, sy, sz = SHOULDER
    for s, side in ((1, "L"), (-1, "R")):
        piv = empty(f"Kol_Pivot_{side}", (sx * s, sy, sz), upper)
        piv.rotation_mode = 'QUATERNION'
        x = sx * s
        sphere(f"Omuz_{side}", (x, 0, sz), 0.165, (1, 1, 1), P["red"], piv)
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.152, radius2=0.165, depth=0.4, location=(x, 0, sz - 0.2))
        o = bpy.context.object; o.name = f"Kol_{side}"
        _finish(o, P["red"], piv)
        cf = torus(f"Kol_Kurk_{side}", (x, 0, sz - 0.4), 0.15, 0.07, P["fur"], piv)
        fur(cf, 0.02, 0.035)
        sphere(f"Eldiven_{side}", (x, -0.01, sz - ARM_LEN), 0.145, (1.0, 0.82, 1.08), P["red"], piv)
        sphere(f"Basparmak_{side}", (x - 0.11 * s, -0.05, sz - ARM_LEN + 0.05), 0.06, (1, 1, 1.35), P["red"], piv,
               rot=(0, -25 * s, 0))

    # ---------------------------------------------------------------- head
    head = empty("Kafa_Pivot", (0, 0, HEAD_PIVOT_Z), upper)
    sphere("Kafa", (0, 0, 1.72), 0.55, (1.05, 1, 0.97), P["skin"], head, seg=64)

    # beard: a fan of locks -> scalloped edge, pointed tip, strand grooves
    prims = [("s", (0, -0.17, 1.33), 0.48, (1.0, 0.72, 0.78), (0, 0, 0))]
    n = 9
    for i in range(n):
        u = (i - (n - 1) / 2) / ((n - 1) / 2)          # -1..1
        c = 1 - abs(u)
        prims.append(("s", (0.43 * u, -0.3 - 0.24 * c, 1.19 - 0.12 * c), 0.15,
                      (1.0, 0.75, 1.5 + 0.72 * c ** 1.3), (-16 * c, -22 * u, 0)))
    for s in (1, -1):
        prims.append(("s", (0.47 * s, -0.06, 1.64), 0.2, (0.72, 1.0, 1.4), (0, 0, 0)))
        prims.append(("s", (0.5 * s, -0.12, 1.42), 0.15, (0.9, 1.0, 1.0), (0, 0, 0)))
    beard = blob("Sakal", prims, voxel=0.013, smooth_iter=6, grooves=0.011, groove_scale=0.03)
    _finish(beard, P["beard"], head, apply_scale=False)

    # mustache with curled ends
    for s in (1, -1):
        mprims = [
            ("s", (0.15 * s, -0.6, 1.52), 0.15, (1.25, 0.62, 0.62), (0, 15 * s, 0)),
            ("s", (0.31 * s, -0.56, 1.5), 0.085, (1.2, 0.8, 0.8), (0, -10 * s, 0)),
            ("s", (0.39 * s, -0.53, 1.56), 0.055, (1, 1, 1), (0, 0, 0)),
        ]
        m = blob(f"Biyik_{s}", mprims, voxel=0.011, smooth_iter=6, grooves=0.006, groove_scale=0.025)
        _finish(m, P["beard"], head, apply_scale=False)
    mouth = sphere("Agiz", (0, -0.6, 1.41), 0.1, (1.0, 0.5, 0.85), P["mouth"], head)
    sphere("Dil", (0, -0.635, 1.36), 0.06, (1.2, 0.5, 0.6), P["tongue"], mouth, outline=False)

    # face
    sphere("Burun", (0, -0.6, 1.64), 0.1, (1.05, 0.9, 0.95), P["nose"], head)
    for s in (1, -1):
        eye = sphere(f"Goz_{s}", (0.2 * s, -0.5, 1.81), 0.125, (0.9, 0.5, 1.12), P["eye"], head, apply_scale=False)
        sphere(f"Goz_Parlak_{s}", (0.2 * s - 0.04, -0.56, 1.86), 0.042, (1, 1, 1), P["white"], eye, outline=False, seg=24)
        sphere(f"Goz_Parlak2_{s}", (0.2 * s + 0.045, -0.56, 1.76), 0.018, (1, 1, 1), P["white"], eye, outline=False, seg=16)
        bprims = [("s", (0.2 * s + 0.07 * k * s, -0.47, 1.965 + 0.012 * (1 - abs(k))), 0.055, (1.1, 0.6, 0.7), (0, 0, 0))
                  for k in (-1, 0, 1)]
        brow = blob(f"Kas_{s}", bprims, voxel=0.01, smooth_iter=4)
        # pivot at brow centre so mood rotations stay local
        bpy.context.view_layer.objects.active = brow
        bpy.ops.object.select_all(action='DESELECT')
        brow.select_set(True)
        bpy.context.scene.cursor.location = (0.2 * s, -0.47, 1.97)
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
        brow.rotation_euler = (0, R(12 * s), 0)
        _finish(brow, P["eyebrow"], head, apply_scale=False, width=0.015)
        sphere(f"Yanak_{s}", (0.33 * s, -0.43, 1.65), 0.1, (1.0, 0.45, 0.75), P["cheek"], head, outline=False)
        sphere(f"Kulak_{s}", (0.56 * s, 0, 1.74), 0.08, (0.6, 1, 1.2), P["skin"], head)
    bpy.context.scene.cursor.location = (0, 0, 0)

    # hat
    brim = torus("Sapka_Kurk", (0, 0, 2.17), 0.52, 0.15, P["fur"], head, scale=(1, 0.95, 1))
    fur(brim, 0.035, 0.065)
    hat_p = empty("Sapka_Pivot", (0, 0, 2.19), head)
    tip = (0.68, 0.0, 2.5)
    hat = hat_tube("Sapka", (0, 0, 2.17), (0.05, 0, 2.93), tip, 0.5, 0.07)
    t = _tex("Kumas_Doku", 'CLOUDS', 0.35)
    _finish(hat, P["red"], hat_p, apply_scale=False)
    displace(hat, t, 0.025)
    hat.modifiers.move(hat.modifiers.find(f"Disp_{t.name}"), 0)
    tip_p = empty("Sapka_Uc_Pivot", tip, hat_p)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=0.17, location=(tip[0] + 0.05, 0, tip[2] - 0.08))
    pom = bpy.context.object
    pom.name = "Ponpon"
    _finish(pom, P["fur"], tip_p)
    fur(pom, 0.045, 0.045)
    pom.modifiers.move(pom.modifiers.find(pom.modifiers[-1].name), 0)
    # fur displacement must run before the outline shell
    for o in _COLL.objects:
        if o.type == 'MESH':
            k = o.modifiers.find("Kontur")
            if k != -1 and k != len(o.modifiers) - 1:
                o.modifiers.move(k, len(o.modifiers) - 1)

    bpy.context.view_layer.update()
    return root


# ----------------------------------------------------------------------------
# web export
# ----------------------------------------------------------------------------
EXPORT_ROOTS = ["NoelBaba_Root", "Hediye_1", "Hediye_2", "Hediye_3", "Hediye_4"]


def export_glb(path):
    """Export rig + accessories (rest pose) as GLB for three.js. Outline shells are disabled:
    the web runtime draws its own outlines."""
    if "reset_pose" in globals():
        reset_pose()
    objs = []
    for n in EXPORT_ROOTS:
        r = bpy.data.objects[n]
        objs += [r] + list(r.children_recursive)
    state = {}
    for o in objs:
        state[o.name] = (o.hide_viewport, o.hide_render, o.hide_get())
        o.hide_viewport = False
        o.hide_render = False
        o.hide_set(False)
    toggled = []
    decimated = []
    for o in objs:
        if o.type != 'MESH':
            continue
        for md in o.modifiers:
            if md.name == "Kontur":
                toggled.append((md, md.show_viewport, md.show_render))
                md.show_viewport = md.show_render = False
        if o.name in ("Sakal",):
            d = o.modifiers.new("WebDecimate", "DECIMATE"); d.ratio = 0.22; decimated.append((o, d))
        elif o.name.startswith("Biyik") or o.name.startswith("Kas_"):
            d = o.modifiers.new("WebDecimate", "DECIMATE"); d.ratio = 0.35; decimated.append((o, d))
        elif o.name in ("Ponpon", "Sapka_Kurk", "Etek_Kurk"):
            d = o.modifiers.new("WebDecimate", "DECIMATE"); d.ratio = 0.6; decimated.append((o, d))
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
        export_animations=False, export_texcoords=False, export_normals=True, export_materials='EXPORT',
        export_extras=False, export_cameras=False, export_lights=False,
    )
    for md, v, r in toggled:
        md.show_viewport, md.show_render = v, r
    for o, d in decimated:
        o.modifiers.remove(d)
    for o in objs:
        hv, hr, hs = state[o.name]
        o.hide_viewport, o.hide_render = hv, hr
        o.hide_set(hs)
    tris = 0
    return path


def toon_scene():
    """Lighting / colour management suited for cel shading."""
    sc = bpy.context.scene
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    for n in ("Ana_Isik", "Dolgu_Isik", "Arka_Isik"):
        if n in bpy.data.objects:
            bpy.data.objects[n].hide_render = True
            bpy.data.objects[n].hide_viewport = True
    sun = bpy.data.objects.get("Gunes")
    if not sun:
        ld = bpy.data.lights.new("Gunes", 'SUN')
        sun = bpy.data.objects.new("Gunes", ld)
        bpy.data.collections["Sahne"].objects.link(sun)
    sun.data.energy = 4.0
    sun.data.angle = R(3)
    sun.rotation_euler = (R(50), R(-22), R(-28))
    w = sc.world
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.0
    # accessories -> toon + outline
    for coll in ("Aksesuarlar",):
        for o in bpy.data.collections[coll].all_objects:
            if o.type == 'MESH':
                for m in o.data.materials:
                    if m:
                        convert_material_to_toon(m)
                add_outline(o, 0.018)
