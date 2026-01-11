'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

/* =====================================================
   BRAND SYSTEM
===================================================== */

const BRAND = {
  bg: "#050308",
  purple: "#a855f7",
  purpleSoft: "#c084fc",
  purpleDark: "#6b21a8",
  textMuted: "#a1a1aa",
};

/* =====================================================
   DATA MODEL
===================================================== */

type Note = {
  id: string;
  title: string;
  content: string;
  cluster: keyof typeof CLUSTERS;
  position: THREE.Vector3;
};

/* =====================================================
   CLUSTERS (FEATURE GROUPS)
===================================================== */

const CLUSTERS = {
  Ideas: new THREE.Vector3(-3, 2, 0),
  Research: new THREE.Vector3(3, 2, 0),
  Writing: new THREE.Vector3(-3, -2, 0),
  Tasks: new THREE.Vector3(3, -2, 0),
};

/* =====================================================
   STORAGE
===================================================== */

const STORAGE_KEY = "notes_webgl_layout_v2";

function saveLayout(notes: Note[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      notes.map(n => ({
        ...n,
        position: { x: n.position.x, y: n.position.y, z: n.position.z },
      }))
    )
  );
}

function loadLayout(): Note[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw).map((n: any) => ({
      ...n,
      position: new THREE.Vector3(n.position.x, n.position.y, n.position.z),
    }));
  } catch {
    return null;
  }
}

/* =====================================================
   CUSTOM GLOW SHADER
===================================================== */

const GlowShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(BRAND.purple) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    float glow(vec2 uv) {
      float d = distance(uv, vec2(0.5));
      return exp(-d * 6.0);
    }

    void main() {
      float g = glow(vUv);
      float pulse = 0.85 + 0.15 * sin(time * 0.6);
      gl_FragColor = vec4(color * g * pulse, g);
    }
  `,
};

/* =====================================================
   CAMERA RIG (SMOOTH SEMANTIC ZOOM)
===================================================== */

function CameraRig({ focus }: { focus: THREE.Vector3 | null }) {
  const { camera } = useThree();

  useFrame(() => {
    const target = focus
      ? new THREE.Vector3(focus.x, focus.y, 3)
      : new THREE.Vector3(0, 0, 8);

    camera.position.lerp(target, 0.06);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* =====================================================
   NOTE MESH (GLOW + NOISE)
===================================================== */

function NoteMesh({
  note,
  focus,
  onClick,
  onDragEnd,
}: {
  note: Note;
  focus: THREE.Vector3 | null;
  onClick: () => void;
  onDragEnd: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const dragging = useRef(false);

  useFrame((state) => {
    if (!ref.current || !mat.current) return;

    mat.current.uniforms.time.value = state.clock.elapsedTime;

    // subtle organic motion
    ref.current.position.y += Math.sin(state.clock.elapsedTime + Number(note.id)) * 0.0008;

    // semantic zoom scaling
    if (focus) {
      const d = note.position.distanceTo(focus);
      ref.current.scale.setScalar(d < 1.5 ? 1.15 : 0.9);
    } else {
      ref.current.scale.setScalar(1);
    }

    // cluster attraction
    if (!dragging.current) {
      const target = CLUSTERS[note.cluster];
      ref.current.position.lerp(target, 0.015);
      note.position.copy(ref.current.position);
    }
  });

  return (
    <group>
      <mesh
        ref={ref}
        position={note.position}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          dragging.current = true;
        }}
        onPointerUp={() => {
          dragging.current = false;
          onDragEnd();
        }}
        onPointerMove={(e) => {
          if (!dragging.current || !ref.current) return;
          ref.current.position.x = e.point.x;
          ref.current.position.y = e.point.y;
          note.position.copy(ref.current.position);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[0.38, 64, 64]} />
        <shaderMaterial
          ref={mat}
          transparent
          uniforms={GlowShader.uniforms}
          vertexShader={GlowShader.vertexShader}
          fragmentShader={GlowShader.fragmentShader}
        />
      </mesh>

      <Html position={[note.position.x, note.position.y + 0.6, 0]}>
        <div className="text-xs text-white font-medium whitespace-nowrap">
          {note.title}
        </div>
        <div className="text-[10px] text-purple-300 font-mono">
          {note.cluster}
        </div>
      </Html>
    </group>
  );
}

/* =====================================================
   CLUSTER HALO
===================================================== */

function ClusterHalo({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1.3, 64]} />
      <meshBasicMaterial
        color={BRAND.purple}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* =====================================================
   SCENE
===================================================== */

function Scene({
  notes,
  setActiveNote,
  focus,
}: {
  notes: Note[];
  setActiveNote: (n: Note | null) => void;
  focus: THREE.Vector3 | null;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <CameraRig focus={focus} />

      {Object.values(CLUSTERS).map((p, i) => (
        <ClusterHalo key={i} position={p} />
      ))}

      {notes.map(note => (
        <NoteMesh
          key={note.id}
          note={note}
          focus={focus}
          onClick={() => setActiveNote(note)}
          onDragEnd={() => saveLayout(notes)}
        />
      ))}

      <OrbitControls enableRotate={false} enableZoom={false} />
    </>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    const saved = loadLayout();
    if (saved) {
      setNotes(saved);
    } else {
      setNotes([
        { id: "1", title: "Startup ideas", content: "", cluster: "Ideas", position: new THREE.Vector3(-3, 2, 0) },
        { id: "2", title: "AI research", content: "", cluster: "Research", position: new THREE.Vector3(3, 2, 0) },
        { id: "3", title: "Writing draft", content: "", cluster: "Writing", position: new THREE.Vector3(-3, -2, 0) },
        { id: "4", title: "Tasks & plans", content: "", cluster: "Tasks", position: new THREE.Vector3(3, -2, 0) },
      ]);
    }
  }, []);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: BRAND.bg }}>
      <Navbar />

      {/* =========================
          HERO WEBGL
      ========================= */}
      <section className="relative h-screen">
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
          <Scene
            notes={notes}
            setActiveNote={setActiveNote}
            focus={activeNote?.position ?? null}
          />
        </Canvas>

        <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
          <div>
            <span className="text-sm font-mono tracking-widest text-purple-300">
              AI NOTES SYSTEM
            </span>
            <h1 className="text-[clamp(4rem,8vw,8rem)] font-bold leading-none mt-4 text-white">
              Intelligence,<br />visualized.
            </h1>
            <p className="mt-6 text-xl max-w-2xl mx-auto" style={{ color: BRAND.textMuted }}>
              Drag notes. Watch clusters form. Zoom into meaning.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          EDITOR
      ========================= */}
      {activeNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center">
          <div className="bg-black border border-purple-500/30 rounded-3xl p-8 w-[440px]">
            <h3 className="text-2xl font-semibold mb-4 text-white">{activeNote.title}</h3>
            <textarea
              className="w-full h-40 bg-black border border-white/10 rounded-xl p-4 text-zinc-300"
              placeholder="Start writing..."
            />
            <button
              className="mt-4 px-6 py-3 rounded-full"
              style={{ background: BRAND.purple }}
              onClick={() => setActiveNote(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =========================
          CTA
      ========================= */}
      <section className="py-40 border-t border-purple-500/20 text-center">
        <h2 className="text-5xl font-semibold text-white">
          A workspace that thinks with you.
        </h2>
        <p className="mt-6 text-xl" style={{ color: BRAND.textMuted }}>
          Calm. Visual. Intelligent.
        </p>
        <Link href="/notes">
          <button
            className="mt-10 px-14 py-6 rounded-full text-lg text-black"
            style={{ background: BRAND.purple }}
          >
            Start using it →
          </button>
        </Link>
      </section>
    </div>
  );
}
