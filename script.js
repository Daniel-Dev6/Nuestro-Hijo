import * as THREE from "three";

const canvas = document.querySelector(".scene");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
const sculpture = new THREE.Group();
const pointer = new THREE.Vector2();
const targetRotation = new THREE.Vector2();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

camera.position.set(0, 0, 7.2);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
scene.add(sculpture);

scene.add(new THREE.HemisphereLight(0xffffff, 0x64736a, 2.1));

const keyLight = new THREE.DirectionalLight(0xfff1d5, 4);
keyLight.position.set(-3, 4, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x56a894, 28, 12);
rimLight.position.set(3, -2, -1);
scene.add(rimLight);

const starShape = new THREE.Shape();
const outerRadius = 1.15;
const innerRadius = 0.52;

for (let point = 0; point < 10; point += 1) {
	const radius = point % 2 === 0 ? outerRadius : innerRadius;
	const angle = (point / 10) * Math.PI * 2 - Math.PI / 2;
	const x = Math.cos(angle) * radius;
	const y = Math.sin(angle) * radius;

	if (point === 0) {
		starShape.moveTo(x, y);
	} else {
		starShape.lineTo(x, y);
	}
}

starShape.closePath();

const starGeometry = new THREE.ExtrudeGeometry(starShape, {
	depth: 0.32,
	bevelEnabled: true,
	bevelSegments: 4,
	steps: 1,
	bevelSize: 0.09,
	bevelThickness: 0.09
});
starGeometry.center();

const starMaterial = new THREE.MeshPhysicalMaterial({
	color: 0xf7b267,
	roughness: 0.18,
	metalness: 0.06,
	clearcoat: 1,
	clearcoatRoughness: 0.12,
	emissive: 0xff8a4c,
	emissiveIntensity: 0.45
});

const star = new THREE.Mesh(starGeometry, starMaterial);
star.rotation.set(-0.2, 0.15, 0.12);
star.scale.set(1.08, 1.08, 1.08);
star.position.set(0.9, 0.18, 0.15);
sculpture.add(star);

const trail = new THREE.Mesh(
	new THREE.ConeGeometry(0.14, 1.8, 18),
	new THREE.MeshPhysicalMaterial({
		color: 0xffd6a5,
		emissive: 0xffb067,
		emissiveIntensity: 0.7,
		transparent: true,
		opacity: 0.72,
		roughness: 0.4,
		metalness: 0.15,
		clearcoat: 0.9,
		clearcoatRoughness: 0.2,
		side: THREE.DoubleSide
	})
);
trail.rotation.z = -Math.PI / 2;
trail.rotation.y = 0.35;
trail.position.set(-0.72, 0.12, -0.4);
sculpture.add(trail);

const trailGlow = new THREE.Mesh(
	new THREE.ConeGeometry(0.24, 1.25, 12),
	new THREE.MeshBasicMaterial({
		color: 0xffe6a7,
		transparent: true,
		opacity: 0.24,
		side: THREE.DoubleSide
	})
);
trailGlow.rotation.z = -Math.PI / 2;
trailGlow.rotation.y = 0.15;
trailGlow.position.set(-1.5, 0.18, -0.5);
sculpture.add(trailGlow);

const spark = new THREE.Mesh(
	new THREE.SphereGeometry(0.085, 16, 16),
	new THREE.MeshBasicMaterial({ color: 0xfff0c2, transparent: true, opacity: 0.8 })
);
spark.position.set(-1.8, 0.3, -0.55);
sculpture.add(spark);

function resizeScene() {
	const { clientWidth, clientHeight } = canvas;
	renderer.setSize(clientWidth, clientHeight, false);
	camera.aspect = clientWidth / clientHeight;
	camera.position.z = clientWidth < 700 ? 8 : 7.2;
	camera.updateProjectionMatrix();
	sculpture.position.x = clientWidth < 700 ? 0 : 1.15;
	sculpture.scale.setScalar(clientWidth < 700 ? 0.78 : 1);
}

const resizeObserver = new ResizeObserver(resizeScene);
resizeObserver.observe(canvas);
resizeScene();

window.addEventListener("pointermove", (event) => {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
	targetRotation.x = pointer.y * 0.2;
	targetRotation.y = pointer.x * 0.28;
}, { passive: true });

const clock = new THREE.Clock();

function animate() {
	const elapsed = clock.getElapsedTime();

	if (!reducedMotion.matches) {
		sculpture.rotation.x += (targetRotation.x - sculpture.rotation.x) * 0.035;
		sculpture.rotation.y += (targetRotation.y - sculpture.rotation.y) * 0.035;
		sculpture.rotation.y += 0.002;
		sculpture.position.y = Math.sin(elapsed * 0.8) * 0.08;
		trail.rotation.z = -Math.PI / 2 + Math.sin(elapsed * 1.9) * 0.18;
		trailGlow.rotation.z = -Math.PI / 2 + Math.sin(elapsed * 1.4) * 0.12;
		spark.position.y = 0.3 + Math.sin(elapsed * 3.4) * 0.12;
	}

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

animate();
