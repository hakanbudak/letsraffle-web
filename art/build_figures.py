"""
Lets Raffle - extra Christmas figures (snowman, Rudolph, tree, candy) in the
same toon style as the Santa (build_character.py helpers must be in `ns`).

In Blender:
    ns = {}; exec(open(".../art/build_character.py").read(), ns)
    exec(open(".../art/build_figures.py").read(), ns)
    ns["build_snowman"]()   # creates scene "Fig_Snowman"
"""
import bpy, math
from mathutils import Vector

R = math.radians
FIG_FRAMES = 72


def fig_scene(name, res=(720, 900), ortho=3.75, target_z=1.58, cam_z=3.2):
    sc = bpy.data.scenes.get(name) or bpy.data.scenes.new(name)
    bpy.context.window.scene = sc
    for o in list(sc.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    coll = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if coll.name not in sc.collection.children:
        sc.collection.children.link(coll)
    globals()["_COLL"] = coll
    sc.render.engine = 'BLENDER_EEVEE'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.render.film_transparent = True
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.fps = 24
    sc.frame_start, sc.frame_end = 1, FIG_FRAMES
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    try:
        sc.eevee.taa_render_samples = 32
    except Exception:
        pass
    w = bpy.data.worlds.get("FigWorld") or bpy.data.worlds.new("FigWorld")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.0
    ld = bpy.data.lights.new(name + "_Sun", 'SUN')
    ld.energy = 4.0
    ld.angle = R(3)
    sun = bpy.data.objects.new(name + "_Sun", ld)
    coll.objects.link(sun)
    sun.rotation_euler = (R(50), R(-22), R(-28))
    cd = bpy.data.cameras.new(name + "_Cam")
    cd.type = 'ORTHO'
    cd.ortho_scale = ortho
    cam = bpy.data.objects.new(name + "_Cam", cd)
    coll.objects.link(cam)
    sc.camera = cam
    cam.location = (0, -10, cam_z)
    d = Vector((0, 0, target_z)) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return sc, coll


def kf(o, path, frame, value, index=-1):
    attr = getattr(o, path)
    if index >= 0:
        attr[index] = value
    else:
        setattr(o, path, value)
    o.keyframe_insert(path, frame=frame, index=index)


def cycle_all(objs):
    from bpy_extras import anim_utils
    for o in objs:
        ad = o.animation_data
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


def cone(name, loc, r1, r2, depth, mat, parent=None, rot=(0, 0, 0), outline=True):
    bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=r1, radius2=r2, depth=depth, location=loc,
                                    rotation=tuple(R(a) for a in rot))
    o = bpy.context.object
    o.name = name
    return _finish(o, mat, parent, outline)


def pivot(name, loc, parent=None):
    return empty(name, loc, parent)


def blink(eyes, frames=((22, 26), (58, 62))):
    for e in eyes:
        s = e.scale.copy()
        kf(e, "scale", 1, s)
        for a, b in frames:
            kf(e, "scale", a, s)
            kf(e, "scale", (a + b) // 2, Vector((s.x, s.y, s.z * 0.1)))
            kf(e, "scale", b, s)
        kf(e, "scale", FIG_FRAMES + 1, s)


# ----------------------------------------------------------------------------
# snowman
# ----------------------------------------------------------------------------
def build_snowman():
    sc, coll = fig_scene("Fig_Snowman")
    snow = toon_mat("S_Snow", "#f7fbff", "#c7d6e6")
    coal = toon_mat("S_Coal", "#2a2424", "#1a1616")
    carrot = toon_mat("S_Carrot", "#f5892b", "#d2661a")
    scarf = toon_mat("S_Scarf", "#d9363c", "#a8191f")
    scarf2 = toon_mat("S_Scarf2", "#2f8a4f", "#1f5c3e")
    wood = toon_mat("S_Wood", "#7a4a2a", "#57331c")
    cheek = toon_mat("S_Cheek", "#f6a9b0", "#e88f98")
    fur_m = toon_mat("S_Fur", "#fbf7f1", "#ddd5cb")
    white = toon_mat("S_White", "#ffffff", "#ffffff")

    root = pivot("SM_Root", (0, 0, 0))
    body = pivot("SM_Body", (0, 0, 0.05), root)
    b1 = sphere("SM_Bottom", (0, 0, 0.72), 0.78, scale=(1, 0.95, 0.9), mat=snow, parent=body)
    b2 = sphere("SM_Middle", (0, 0, 1.68), 0.56, scale=(1, 0.95, 0.92), mat=snow, parent=body)
    head = pivot("SM_Head", (0, 0, 2.15), body)
    h = sphere("SM_HeadBall", (0, 0, 2.48), 0.46, mat=snow, parent=head)
    for o in (b1, b2, h):
        fur(o, strength=0.012, scale=0.08)
    eyes = [sphere(f"SM_Eye{i}", (x, -0.39, 2.58), 0.075, scale=(0.9, 0.6, 1.15), mat=coal, parent=head)
            for i, x in enumerate((-0.15, 0.15))]
    for i, x in enumerate((-0.15, 0.15)):
        sphere(f"SM_Glint{i}", (x + 0.025, -0.44, 2.615), 0.022, mat=white, parent=head, outline=False)
    for i, x in enumerate((-0.27, 0.27)):
        sphere(f"SM_Cheek{i}", (x, -0.36, 2.44), 0.07, scale=(1.2, 0.4, 0.8), mat=cheek, parent=head, outline=False)
    cone("SM_Nose", (0.02, -0.62, 2.47), 0.075, 0.0, 0.42, carrot, parent=head, rot=(90, 0, 4))
    for i, a in enumerate((-42, -22, 0, 22, 42)):
        x = math.sin(R(a)) * 0.2
        z = 2.33 - math.cos(R(a)) * 0.07 + 0.07
        sphere(f"SM_Smile{i}", (x, -0.415 + abs(x) * 0.12, z), 0.028, mat=coal, parent=head, outline=False)
    hat = hat_tube("SM_Hat", (0, 0, 2.78), (0.05, 0, 3.22), (0.42, 0, 3.12), 0.4, 0.05)
    _finish(hat, scarf, head)
    trim = torus("SM_HatTrim", (0, 0, 2.8), 0.4, 0.09, fur_m, parent=head, scale=(1, 0.95, 1))
    fur(trim, strength=0.02, scale=0.05)
    pom = sphere("SM_Pom", (0.46, 0, 3.06), 0.11, mat=fur_m, parent=head)
    fur(pom, strength=0.02, scale=0.04)
    torus("SM_Scarf", (0, 0, 2.08), 0.4, 0.11, scarf, parent=body, scale=(1, 0.95, 0.85))
    for i, z in enumerate((2.04, 2.13)):
        torus(f"SM_ScarfStripe{i}", (0, 0, z), 0.405, 0.03, scarf2, parent=body, scale=(1, 0.95, 0.85), outline=False)
    tail = rbox("SM_ScarfTail", (0.22, -0.42, 1.78), (0.17, 0.08, 0.5), 0.04, scarf, parent=body)
    tail.rotation_euler = (R(8), R(-12), R(-6))
    for i, z in enumerate((1.86, 1.66, 1.46)):
        sphere(f"SM_Button{i}", (0, -0.52 + abs(z - 1.66) * 0.18, z), 0.055, mat=coal, parent=body)

    def arm(side, name):
        sh = pivot(name, (0.5 * side, 0, 1.78), body)
        cyl(name + "_Stick", (0.5 * side + 0.42 * side, 0, 1.78), 0.032, 0.86, wood, parent=sh, rot=(0, 90, 0))
        for j, (dx, dz, ang) in enumerate(((0.78, 0.07, 40), (0.7, -0.06, -35))):
            cyl(f"{name}_Twig{j}", (0.5 * side + dx * side, 0, 1.78 + dz), 0.022, 0.2, wood, parent=sh,
                rot=(0, 90 - ang * side, 0))
        return sh
    arm_l = arm(-1, "SM_ArmL")
    arm_r = arm(1, "SM_ArmR")
    F = FIG_FRAMES
    for f, a in ((1, 35), (12, 60), (24, 35), (36, 60), (48, 35), (60, 30), (F + 1, 35)):
        kf(arm_r, "rotation_euler", f, (0, R(-a), 0))
    for f, a in ((1, -20), (36, -26), (F + 1, -20)):
        kf(arm_l, "rotation_euler", f, (0, R(-a), 0))
    for f, (rz, ry) in ((1, (0, 0)), (18, (4, -3)), (36, (0, 0)), (54, (-4, 3)), (F + 1, (0, 0))):
        kf(head, "rotation_euler", f, (0, R(ry), R(rz)))
    for f, s in ((1, 1.0), (18, 1.015), (36, 1.0), (54, 1.015), (F + 1, 1.0)):
        kf(body, "scale", f, (1 / math.sqrt(s), 1 / math.sqrt(s), s))
    blink(eyes)
    cycle_all([arm_r, arm_l, head, body] + eyes)
    sc.frame_set(1)
    return sc


def render_fig(scene_name, out_dir, frames=None):
    sc = bpy.data.scenes[scene_name]
    bpy.context.window.scene = sc
    sc.render.filepath = out_dir.rstrip("/") + "/frame_"
    if frames:
        sc.frame_start, sc.frame_end = frames
    bpy.ops.render.render(animation=True)


# ----------------------------------------------------------------------------
# Rudolph (sitting, facing camera; red nose glows)
# ----------------------------------------------------------------------------
def build_rudolph():
    sc, coll = fig_scene("Fig_Rudolph")
    fur_b = toon_mat("R_Fur", "#a8693f", "#7d4a2a")
    cream = toon_mat("R_Cream", "#f3dcc0", "#d9b994")
    hoof = toon_mat("R_Hoof", "#3a2a22", "#261a15")
    antler = toon_mat("R_Antler", "#e6c48f", "#c49a5e")
    eye = toon_mat("R_Eye", "#1d1717", "#1d1717")
    white = toon_mat("R_White", "#ffffff", "#ffffff")
    cheek = toon_mat("R_Cheek", "#f4a0a0", "#e08787")
    collar = toon_mat("R_Collar", "#2f8a4f", "#1f5c3e")
    gold = toon_mat("R_Gold", "#f5c84a", "#d0962a")
    nose = toon_mat("R_Nose", "#ff3b3b", "#d01c22")

    root = pivot("RU_Root", (0, 0, 0))
    body = pivot("RU_Body", (0, 0, 0), root)
    sphere("RU_Torso", (0, 0.05, 0.95), 0.62, scale=(0.95, 0.85, 1.05), mat=fur_b, parent=body)
    sphere("RU_Belly", (0, -0.4, 0.9), 0.4, scale=(0.9, 0.45, 1.05), mat=cream, parent=body, outline=False)
    # back legs (sitting haunches) + front legs
    for s in (-1, 1):
        sphere(f"RU_Haunch{s}", (0.48 * s, 0.05, 0.42), 0.36, scale=(0.9, 1.2, 0.8), mat=fur_b, parent=body)
        sphere(f"RU_Foot{s}", (0.52 * s, -0.38, 0.12), 0.16, scale=(1, 1.3, 0.7), mat=hoof, parent=body)
        cyl(f"RU_Leg{s}", (0.22 * s, -0.3, 0.42), 0.11, 0.72, fur_b, parent=body)
        sphere(f"RU_Hoof{s}", (0.22 * s, -0.33, 0.07), 0.13, scale=(1, 1.1, 0.7), mat=hoof, parent=body)
    torus("RU_Collar", (0, 0, 1.48), 0.34, 0.07, collar, parent=body, scale=(1, 0.95, 0.8))
    bell = sphere("RU_Bell", (0, -0.36, 1.36), 0.11, mat=gold, parent=body)
    head = pivot("RU_Head", (0, 0, 1.55), body)
    sphere("RU_HeadBall", (0, 0, 1.98), 0.48, scale=(1, 0.95, 0.95), mat=fur_b, parent=head)
    sphere("RU_Muzzle", (0, -0.36, 1.82), 0.27, scale=(1.1, 0.8, 0.75), mat=cream, parent=head)
    n = sphere("RU_Nose", (0, -0.6, 1.88), 0.12, mat=nose, parent=head)
    sphere("RU_NoseGlint", (-0.04, -0.71, 1.93), 0.03, mat=white, parent=head, outline=False)
    eyes = [sphere(f"RU_Eye{i}", (x, -0.4, 2.1), 0.11, scale=(0.85, 0.55, 1.15), mat=eye, parent=head)
            for i, x in enumerate((-0.17, 0.17))]
    for i, x in enumerate((-0.17, 0.17)):
        sphere(f"RU_Glint{i}", (x + 0.035, -0.46, 2.15), 0.035, mat=white, parent=head, outline=False)
        sphere(f"RU_Cheek{i}", (x * 1.65, -0.36, 1.92), 0.065, scale=(1.2, 0.4, 0.8), mat=cheek, parent=head, outline=False)
    ears = []
    for s in (-1, 1):
        ep = pivot(f"RU_EarP{s}", (0.42 * s, 0, 2.12), head)
        sphere(f"RU_Ear{s}", (0.6 * s, 0, 2.16), 0.17, scale=(1.4, 0.45, 0.7), mat=fur_b, parent=ep, rot=(0, -20 * s, 0))
        ears.append(ep)
    # antlers: main curved branch + two tines each side
    for s in (-1, 1):
        a = hat_tube(f"RU_Antler{s}", (0.2 * s, 0.05, 2.35), (0.3 * s, 0.05, 2.75), (0.55 * s, 0.05, 2.9), 0.055, 0.035, rings=16, seg=16)
        _finish(a, antler, head)
        t1 = hat_tube(f"RU_Tine1{s}", (0.3 * s, 0.05, 2.62), (0.22 * s, 0.05, 2.8), (0.2 * s, 0.05, 2.93), 0.04, 0.028, rings=10, seg=14)
        _finish(t1, antler, head)
        t2 = hat_tube(f"RU_Tine2{s}", (0.45 * s, 0.05, 2.83), (0.46 * s, 0.05, 2.95), (0.42 * s, 0.05, 3.04), 0.034, 0.024, rings=10, seg=14)
        _finish(t2, antler, head)
    sphere("RU_Tail", (0, 0.6, 0.6), 0.12, mat=cream, parent=body)
    # ---- animation
    F = FIG_FRAMES
    for f, (rz, ry) in ((1, (0, 0)), (18, (6, 4)), (36, (0, 0)), (54, (-6, -4)), (F + 1, (0, 0))):
        kf(head, "rotation_euler", f, (0, R(ry), R(rz)))
    for i, ep in enumerate(ears):
        s = -1 if i == 0 else 1
        for f, a in ((1, 0), (10, 14), (20, 0), (46, 0), (56, 14), (66, 0), (F + 1, 0)):
            kf(ep, "rotation_euler", f, (0, R(a * s), 0))
    for f, v in ((1, 1.0), (12, 1.12), (24, 1.0), (36, 1.12), (48, 1.0), (60, 1.12), (F + 1, 1.0)):
        kf(n, "scale", f, (v, v, v))
    emi = next(nd for nd in nose.node_tree.nodes if nd.type == 'EMISSION')
    for f, v in ((1, 1.0), (12, 1.9), (24, 1.0), (36, 1.9), (48, 1.0), (60, 1.9), (F + 1, 1.0)):
        emi.inputs["Strength"].default_value = v
        emi.inputs["Strength"].keyframe_insert("default_value", frame=f)
    for f, a in ((1, 0), (18, 8), (36, 0), (54, -8), (F + 1, 0)):
        kf(bell, "rotation_euler", f, (0, R(a), 0))
    blink(eyes, frames=((30, 34),))
    cycle_all([head, n, bell] + ears + eyes)
    nt_ad = nose.node_tree.animation_data
    if nt_ad and nt_ad.action:
        from bpy_extras import anim_utils
        cb = anim_utils.action_get_channelbag_for_slot(nt_ad.action, nt_ad.action_slot)
        if cb:
            for fc in cb.fcurves:
                if not any(m.type == 'CYCLES' for m in fc.modifiers):
                    fc.modifiers.new('CYCLES')
    sc.frame_set(1)
    return sc


# ----------------------------------------------------------------------------
# decorated Christmas tree (lights twinkle, star sways)
# ----------------------------------------------------------------------------
def _star_mesh(name, r_out=0.24, r_in=0.1, depth=0.08):
    import bmesh
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        r = r_out if i % 2 == 0 else r_in
        vs.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]:
        v.co.y += depth
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o


def build_tree():
    sc, coll = fig_scene("Fig_Tree")
    green = toon_mat("T_Green", "#2f9a58", "#1d6b3c")
    snow = toon_mat("T_Snow", "#f7fbff", "#cddbe8")
    trunk = toon_mat("T_Trunk", "#7a4a2a", "#57331c")
    pot = toon_mat("T_Pot", "#d9363c", "#a8191f")
    gold = toon_mat("T_Gold", "#f5c84a", "#d0962a")
    orn = [toon_mat("T_OrnRed", "#e5453c", "#b02a25"), gold, toon_mat("T_OrnBlue", "#3f8fd8", "#2a68a8"),
           toon_mat("T_OrnPink", "#f07fa8", "#c95c84")]
    bulbs = [toon_mat(f"T_Bulb{i}", c, c) for i, c in enumerate(("#fff3a0", "#ff6b6b", "#7fe0ff"))]
    root = pivot("TR_Root", (0, 0, 0))
    rbox("TR_Pot", (0, 0, 0.22), (0.62, 0.62, 0.44), 0.06, pot, parent=root)
    rbox("TR_PotRim", (0, 0, 0.46), (0.72, 0.72, 0.1), 0.04, gold, parent=root)
    cyl("TR_Trunk", (0, 0, 0.62), 0.12, 0.3, trunk, parent=root)
    tiers = [(0.72, 1.55, 1.0), (1.32, 2.15, 0.8), (1.86, 2.75, 0.58)]  # z0, apex, base radius
    for i, (z0, z1, rb) in enumerate(tiers):
        c = cone(f"TR_Tier{i}", (0, 0, (z0 + z1) / 2), rb, 0.0, z1 - z0, green, parent=root)
        cap = cone(f"TR_Snow{i}", (0, 0, z1 - (z1 - z0) * 0.18), rb * 0.32, 0.0, (z1 - z0) * 0.36, snow, parent=root)
        rim = torus(f"TR_Rim{i}", (0, 0, z0 + 0.03), rb * 0.98, 0.07, green, parent=root, scale=(1, 0.95, 0.6))
    # ornaments and lights on the front half
    import random
    rnd = random.Random(4)
    lights = []
    k = 0
    for i, (z0, z1, rb) in enumerate(tiers):
        for j in range(5 - i):
            ang = R(-160 + (j + 0.5) * (140 / (5 - i)) + rnd.uniform(-8, 8))
            z = z0 + (z1 - z0) * rnd.uniform(0.12, 0.42)
            r = rb * (z1 - z) / (z1 - z0) + 0.04
            sphere(f"TR_Orn{i}_{j}", (math.cos(ang) * r, math.sin(ang) * r, z), 0.085, mat=orn[k % len(orn)], parent=root)
            k += 1
        for j in range(7 - i):
            ang = R(-170 + j * (160 / (6 - i)))
            z = z0 + (z1 - z0) * (0.55 + 0.15 * math.sin(j * 1.7))
            r = rb * (z1 - z) / (z1 - z0) + 0.03
            l = sphere(f"TR_Light{i}_{j}", (math.cos(ang) * r, math.sin(ang) * r, z), 0.045,
                       mat=bulbs[(i + j) % 3], parent=root, outline=False)
            lights.append(l)
    star_p = pivot("TR_StarP", (0, 0, 2.78), root)
    st = _star_mesh("TR_Star")
    _finish(st, gold, star_p, smooth=False)
    st.location = (0, -0.04, 2.98)
    # ---- animation: bulbs twinkle (emission strength per colour, offset), star sways
    F = FIG_FRAMES
    for i, m in enumerate(bulbs):
        emi = next(nd for nd in m.node_tree.nodes if nd.type == 'EMISSION')
        seq = [(1, 1.0), (12, 2.2), (24, 0.7), (36, 2.2), (48, 0.7), (60, 2.2), (F + 1, 1.0)]
        for f, v in seq:
            ff = 1 + ((f - 1 + i * 8) % F)
            emi.inputs["Strength"].default_value = v
            emi.inputs["Strength"].keyframe_insert("default_value", frame=ff)
    for f, a in ((1, 0), (18, 6), (36, 0), (54, -6), (F + 1, 0)):
        kf(star_p, "rotation_euler", f, (0, R(a), 0))
    for f, s in ((1, 1.0), (36, 1.08), (F + 1, 1.0)):
        kf(st, "scale", f, (s, s, s))
    cycle_all([star_p, st])
    from bpy_extras import anim_utils
    for m in bulbs:
        ad = m.node_tree.animation_data
        if ad and ad.action:
            cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
            for fc in cb.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'BEZIER'
                if not any(md.type == 'CYCLES' for md in fc.modifiers):
                    fc.modifiers.new('CYCLES')
    sc.frame_set(1)
    return sc


# ----------------------------------------------------------------------------
# candy set (still): candy cane + two wrapped sweets + peppermint
# ----------------------------------------------------------------------------
def build_candy():
    sc, coll = fig_scene("Fig_Candy", res=(900, 700), ortho=2.6, target_z=0.6, cam_z=2.6)
    red = toon_mat("C_Red", "#e0353c", "#a8191f")
    white = toon_mat("C_White", "#fffaf4", "#e6dccf")
    green = toon_mat("C_Green", "#2f9a58", "#1d6b3c")
    gold = toon_mat("C_Gold", "#f5c84a", "#d0962a")
    root = pivot("CA_Root", (0, 0, 0))
    # candy cane: alternating red/white segments along a hook curve
    pts = []
    for i in range(40):
        t = i / 39
        if t < 0.7:
            pts.append(Vector((0, 0, 0.1 + t / 0.7 * 1.1)))
        else:
            a = (t - 0.7) / 0.3 * math.pi
            pts.append(Vector((0.18 - math.cos(a) * 0.18, 0, 1.2 + math.sin(a) * 0.18)))
    for i in range(len(pts) - 1):
        p0, p1 = pts[i], pts[i + 1]
        mid = (p0 + p1) / 2
        d = p1 - p0
        o = cyl(f"CA_Seg{i}", tuple(mid), 0.075, d.length * 1.08, red if (i // 2) % 2 == 0 else white, parent=root, outline=False)
        o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    for i, p in enumerate((pts[0], pts[-1])):
        sphere(f"CA_End{i}", tuple(p), 0.075, mat=red, parent=root, outline=False)
    cane = [o for o in coll.objects if o.name.startswith("CA_Seg") or o.name.startswith("CA_End")]
    for o in cane:
        o.parent = None
    root_c = pivot("CA_CaneP", (0, 0, 0), root)
    for o in cane:
        o.parent = root_c
    root_c.location = (-0.55, 0.1, 0)
    root_c.rotation_euler = (0, R(-14), 0)
    # wrapped sweets
    def sweet(name, loc, mat, rot):
        p = pivot(name, loc, root)
        sphere(name + "_Body", loc, 0.22, scale=(1.25, 0.8, 0.8), mat=mat, parent=p)
        for s in (-1, 1):
            cone(f"{name}_Wrap{s}", (loc[0] + 0.36 * s, loc[1], loc[2]), 0.14, 0.02, 0.22, mat, parent=p,
                 rot=(0, -90 * s, 0))
        p.rotation_euler = tuple(R(a) for a in rot)
        return p
    sweet("CA_SweetA", (0.25, -0.1, 0.25), red, (0, 18, 10))
    sweet("CA_SweetB", (0.72, 0.05, 0.62), green, (0, -24, -8))
    # peppermint disc
    pm = cyl("CA_Mint", (0.62, -0.22, 0.14), 0.24, 0.1, white, parent=root, rot=(90, 0, 0))
    for i in range(6):
        a = i * math.pi / 3
        w = sphere(f"CA_MintSwirl{i}", (0.62 + math.cos(a) * 0.12, -0.28, 0.14 + math.sin(a) * 0.12), 0.07,
                   scale=(1.4, 0.2, 0.55), mat=red, parent=root, outline=False, rot=(0, -math.degrees(a), 0))
    sc.frame_set(1)
    return sc


# ----------------------------------------------------------------------------
# home-page duo: snowman with striped beanie + candy cane, and a penguin in a
# Santa hat. Scarves use the site palette (pine green / gold / cranberry / cream).
# ----------------------------------------------------------------------------
def _candy_cane(prefix, parent, base, height=0.9, hook=0.16, r=0.045):
    red = toon_mat("CC_Red", "#e0353c", "#a8191f")
    white = toon_mat("CC_White", "#fffaf4", "#e6dccf")
    pts = []
    for i in range(30):
        t = i / 29
        if t < 0.7:
            pts.append(Vector((0, 0, t / 0.7 * height)))
        else:
            a = (t - 0.7) / 0.3 * math.pi
            pts.append(Vector((hook - math.cos(a) * hook, 0, height + math.sin(a) * hook)))
    grp = pivot(prefix, base, parent)
    for i in range(len(pts) - 1):
        p0, p1 = pts[i] + Vector(base), pts[i + 1] + Vector(base)
        d = p1 - p0
        o = cyl(f"{prefix}_Seg{i}", tuple((p0 + p1) / 2), r, d.length * 1.12, red if (i // 2) % 2 == 0 else white,
                parent=grp, outline=False)
        o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return grp


def build_snowman_home():
    sc, coll = fig_scene("Fig_SnowmanHome")
    snow = toon_mat("S_Snow", "#f7fbff", "#c7d6e6")
    coal = toon_mat("S_Coal", "#2a2424", "#1a1616")
    carrot = toon_mat("S_Carrot", "#f5892b", "#d2661a")
    pine = toon_mat("H_Pine", "#2f8a4f", "#1f5c3e")
    goldm = toon_mat("H_GoldStripe", "#f5c84a", "#d0962a")
    cran = toon_mat("H_Cran", "#c4242a", "#8e1318")
    cream = toon_mat("H_Cream", "#fffbf5", "#e7dccd")
    wood = toon_mat("S_Wood", "#7a4a2a", "#57331c")
    cheek = toon_mat("S_Cheek", "#f6a9b0", "#e88f98")
    white = toon_mat("S_White", "#ffffff", "#ffffff")

    root = pivot("SH_Root", (0, 0, 0))
    body = pivot("SH_Body", (0, 0, 0.05), root)
    for n, z, r, s in (("Bottom", 0.72, 0.78, (1, 0.95, 0.9)), ("Middle", 1.66, 0.56, (1, 0.95, 0.92))):
        fur(sphere(f"SH_{n}", (0, 0, z), r, scale=s, mat=snow, parent=body), strength=0.012, scale=0.08)
    head = pivot("SH_Head", (0, 0, 2.15), body)
    fur(sphere("SH_HeadBall", (0, 0, 2.48), 0.48, mat=snow, parent=head), strength=0.012, scale=0.08)
    eyes = [sphere(f"SH_Eye{i}", (x, -0.41, 2.56), 0.1, scale=(0.85, 0.55, 1.15), mat=coal, parent=head)
            for i, x in enumerate((-0.16, 0.16))]
    for i, x in enumerate((-0.16, 0.16)):
        sphere(f"SH_Glint{i}", (x + 0.035, -0.47, 2.6), 0.033, mat=white, parent=head, outline=False)
        sphere(f"SH_Cheek{i}", (x * 1.75, -0.37, 2.42), 0.075, scale=(1.2, 0.4, 0.8), mat=cheek, parent=head, outline=False)
    cone("SH_Nose", (0.13, -0.6, 2.46), 0.075, 0.0, 0.42, carrot, parent=head, rot=(78, 0, -30))
    for i, a in enumerate((-48, -24, 0, 24, 48)):
        x = math.sin(R(a)) * 0.2
        sphere(f"SH_Smile{i}", (x, -0.43 + abs(x) * 0.12, 2.33 - math.cos(R(a)) * 0.07 + 0.07), 0.03, mat=coal,
               parent=head, outline=False)
    # striped beanie: dome + stripes + ribbed cuff + pompom
    sphere("SH_Beanie", (0, 0, 2.74), 0.47, scale=(1.02, 1.0, 0.78), mat=cran, parent=head)
    for i, (z, rr) in enumerate(((2.86, 0.44), (3.0, 0.33))):
        torus(f"SH_BeanieStripe{i}", (0, 0, z), rr, 0.045, cream, parent=head, scale=(1, 0.98, 0.7), outline=False)
    torus("SH_Cuff", (0, 0, 2.72), 0.47, 0.085, cream, parent=head, scale=(1, 0.98, 0.9))
    fur(sphere("SH_Pom", (0, 0, 3.17), 0.13, mat=cream, parent=head), strength=0.025, scale=0.04)
    # scarf (pine with gold stripes) + hanging tail with fringe
    torus("SH_Scarf", (0, 0, 2.07), 0.41, 0.115, pine, parent=body, scale=(1, 0.95, 0.85))
    for i, z in enumerate((2.03, 2.12)):
        torus(f"SH_ScarfStripe{i}", (0, 0, z), 0.415, 0.028, goldm, parent=body, scale=(1, 0.95, 0.85), outline=False)
    tail = pivot("SH_Tail", (0.24, -0.4, 1.98), body)
    rbox("SH_TailCloth", (0.24, -0.42, 1.74), (0.2, 0.08, 0.52), 0.04, pine, parent=tail)
    for i, z in enumerate((1.86, 1.68)):
        rbox(f"SH_TailStripe{i}", (0.24, -0.465, z), (0.205, 0.01, 0.045), 0.005, goldm, parent=tail, outline=False)
    for i in range(4):
        cyl(f"SH_Fringe{i}", (0.17 + i * 0.047, -0.42, 1.44), 0.012, 0.1, pine, parent=tail)
    for i, z in enumerate((1.86, 1.66, 1.46)):
        sphere(f"SH_Button{i}", (0, -0.52 + abs(z - 1.66) * 0.18, z), 0.055, mat=coal, parent=body)

    def arm(side, name):
        sh = pivot(name, (0.5 * side, 0, 1.78), body)
        cyl(name + "_Stick", (0.92 * side, 0, 1.78), 0.032, 0.86, wood, parent=sh, rot=(0, 90, 0))
        for j, (dx, dz, ang) in enumerate(((0.78, 0.07, 40), (0.7, -0.06, -35))):
            cyl(f"{name}_Twig{j}", (0.5 * side + dx * side, 0, 1.78 + dz), 0.022, 0.2, wood, parent=sh,
                rot=(0, 90 - ang * side, 0))
        return sh
    arm_l = arm(-1, "SH_ArmL")   # holds the candy cane (viewer's left)
    arm_r = arm(1, "SH_ArmR")    # waves
    _candy_cane("SH_Cane", arm_l, (-1.3, -0.05, 1.6), height=0.62, hook=0.12, r=0.04)
    F = FIG_FRAMES
    for f, a in ((1, 35), (12, 60), (24, 35), (36, 60), (48, 35), (60, 30), (F + 1, 35)):
        kf(arm_r, "rotation_euler", f, (0, R(-a), 0))
    for f, a in ((1, 28), (36, 22), (F + 1, 28)):
        kf(arm_l, "rotation_euler", f, (0, R(a), 0))
    for f, (rz, ry) in ((1, (0, 0)), (18, (4, -3)), (36, (0, 0)), (54, (-4, 3)), (F + 1, (0, 0))):
        kf(head, "rotation_euler", f, (0, R(ry), R(rz)))
    for f, a in ((1, 0), (18, 5), (36, 0), (54, -5), (F + 1, 0)):
        kf(tail, "rotation_euler", f, (0, R(a), 0))
    blink(eyes)
    cycle_all([arm_r, arm_l, head, tail] + eyes)
    sc.frame_set(1)
    return sc


def build_penguin():
    sc, coll = fig_scene("Fig_Penguin")
    navy = toon_mat("P_Navy", "#33415f", "#222c42")
    belly = toon_mat("P_Belly", "#fbf8f2", "#ddd6ca")
    orange = toon_mat("P_Orange", "#f5a623", "#d07f12")
    coal = toon_mat("P_Eye", "#1d1717", "#1d1717")
    cheek = toon_mat("P_Cheek", "#f6a9b0", "#e88f98")
    red = toon_mat("P_Red", "#e5453c", "#b8302c")
    fur_m = toon_mat("P_Fur", "#fbf7f1", "#ddd5cb")
    pine = toon_mat("H_Pine", "#2f8a4f", "#1f5c3e")
    cream = toon_mat("H_Cream", "#fffbf5", "#e7dccd")

    root = pivot("PG_Root", (0, 0, 0))
    body = pivot("PG_Body", (0, 0, 0), root)
    sphere("PG_Torso", (0, 0, 1.0), 0.78, scale=(0.95, 0.85, 1.12), mat=navy, parent=body)
    sphere("PG_Belly", (0, -0.36, 0.92), 0.6, scale=(0.85, 0.55, 1.0), mat=belly, parent=body, outline=False)
    for s in (-1, 1):
        sphere(f"PG_Foot{s}", (0.28 * s, -0.42, 0.1), 0.19, scale=(1.2, 1.4, 0.45), mat=orange, parent=body)
    head = pivot("PG_Head", (0, 0, 1.75), body)
    sphere("PG_HeadBall", (0, 0, 2.15), 0.6, scale=(1, 0.92, 0.9), mat=navy, parent=head)
    for s in (-1, 1):  # heart-shaped face mask
        sphere(f"PG_Face{s}", (0.17 * s, -0.36, 2.1), 0.3, scale=(1, 0.55, 1.05), mat=belly, parent=head, outline=False)
    # happy closed eyes: small arcs
    eyes = []
    for i, x in enumerate((-0.19, 0.19)):
        e = torus(f"PG_Eye{i}", (x, -0.53, 2.2), 0.075, 0.018, coal, parent=head, rot=(90, 0, 0), outline=False)
        bpy.context.view_layer.update()
        me = e.data
        for v in me.vertices:          # keep the upper half -> smiling eye
            if v.co.z < -0.005:
                v.co.z = -0.005
        eyes.append(e)
    for i, x in enumerate((-0.3, 0.3)):
        sphere(f"PG_Cheek{i}", (x, -0.48, 2.05), 0.07, scale=(1.2, 0.4, 0.8), mat=cheek, parent=head, outline=False)
    cone("PG_Beak", (0, -0.62, 2.08), 0.09, 0.0, 0.18, orange, parent=head, rot=(90, 0, 0))
    # Santa hat
    hat = hat_tube("PG_Hat", (0, 0, 2.5), (0.12, 0, 3.05), (0.6, 0, 2.85), 0.52, 0.06)
    _finish(hat, red, head)
    trim = torus("PG_HatTrim", (0, 0, 2.5), 0.52, 0.11, fur_m, parent=head, scale=(1, 0.92, 0.9))
    fur(trim, strength=0.025, scale=0.05)
    fur(sphere("PG_HatPom", (0.65, 0, 2.78), 0.13, mat=fur_m, parent=head), strength=0.025, scale=0.04)
    # striped scarf
    torus("PG_Scarf", (0, 0, 1.72), 0.52, 0.12, pine, parent=body, scale=(1, 0.9, 0.8))
    for i, z in enumerate((1.68, 1.77)):
        torus(f"PG_ScarfStripe{i}", (0, 0, z), 0.525, 0.03, cream, parent=body, scale=(1, 0.9, 0.8), outline=False)
    tail = pivot("PG_Tail", (0.3, -0.42, 1.64), body)
    rbox("PG_TailCloth", (0.36, -0.46, 1.38), (0.22, 0.08, 0.56), 0.04, pine, parent=tail)
    for i, z in enumerate((1.52, 1.34, 1.16)):
        rbox(f"PG_TailStripe{i}", (0.36, -0.505, z), (0.225, 0.01, 0.06), 0.005, cream, parent=tail, outline=False)
    tail.rotation_euler = (0, R(-14), 0)
    # wings (raised, happy)
    wings = []
    for s in (-1, 1):
        wp = pivot(f"PG_WingP{s}", (0.62 * s, 0, 1.45), body)
        sphere(f"PG_Wing{s}", (0.86 * s, 0, 1.55), 0.3, scale=(0.35, 0.6, 1.0), mat=navy, parent=wp, rot=(0, 40 * s, 0))
        wings.append((s, wp))
    # ---- animation: flap + bounce + head bob
    F = FIG_FRAMES
    for s, wp in wings:
        for f, a in ((1, 0), (9, 18), (18, 0), (27, 18), (36, 0), (54, 6), (F + 1, 0)):
            kf(wp, "rotation_euler", f, (0, R(-a * s), 0))
    for f, z in ((1, 0), (9, 0.06), (18, 0), (27, 0.06), (36, 0), (F + 1, 0)):
        kf(body, "location", f, (0, 0, z))
    for f, rz in ((1, 0), (18, 6), (36, 0), (54, -6), (F + 1, 0)):
        kf(head, "rotation_euler", f, (0, 0, R(rz)))
    cycle_all([body, head] + [wp for _, wp in wings])
    sc.frame_set(1)
    return sc
