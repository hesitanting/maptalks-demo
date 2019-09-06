<template>
  <div id="cloud" class="container">
    <div id="startBtn" class="startBtn" @click="JumpTo">start</div>
  </div>
</template>
<script>
import * as THREE from "three";
import * as $ from "jquery";
export default {
  name: "start",
  props: {
    msg: String
  },
  data() {
    return {
      container: null, //动画容器
      camera: null, //相机
      scene: null, //场景
      renderer: null,
      mesh: null,
      geometry: null,
      material: null,
      mouseX: 0,
      mouseY: 0,
      start_time: Date.now(),
      windowHalfX: window.innerWidth / 2,
      windowHalfY: window.innerHeight / 2
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.container = document.getElementById("cloud");
      //背景颜色设置
      var canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = window.innerHeight;

      var context = canvas.getContext("2d");

      var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#1e4877");
      gradient.addColorStop(0.5, "#4584b4");

      //gradient.addColorStop(0, "#4584b4");
      //gradient.addColorStop(0.5, "#00ffff");

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      this.container.style.background =
        "url(" + canvas.toDataURL("image/png") + ")";
      this.container.style.backgroundSize = "32px 100%";

      this.camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / window.innerHeight,
        1,
        3000
      );
      this.camera.position.z = 6000;

      this.scene = new THREE.Scene();

      this.geometry = new THREE.Geometry();

      var texture = new THREE.TextureLoader().load(
        require("../../public/image/cloud.png"),
        this.animate
      );
      texture.magFilter = THREE.LinearMipMapLinearFilter;
      texture.minFilter = THREE.LinearMipMapLinearFilter;

      var fog = new THREE.Fog(0x4584b4, -100, 3000);

      this.material = new THREE.ShaderMaterial({
        uniforms: {
          map: { type: "t", value: texture },
          fogColor: { type: "c", value: fog.color },
          fogNear: { type: "f", value: fog.near },
          fogFar: { type: "f", value: fog.far }
        },
        vertexShader: document.getElementById("vs").textContent,
        fragmentShader: document.getElementById("fs").textContent,
        depthWrite: false,
        depthTest: false,
        transparent: true
      });

      var plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));

      for (var i = 0; i < 8000; i++) {
        plane.position.x = Math.random() * 1000 - 500;
        plane.position.y = -Math.random() * Math.random() * 200 - 15;
        plane.position.z = i;
        plane.rotation.z = Math.random() * Math.PI;
        plane.scale.x = plane.scale.y =
          Math.random() * Math.random() * 1.5 + 0.5;

        plane.updateMatrix();

        this.geometry.merge(plane.geometry, plane.matrix);
      }

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.position.z = -9000;
      this.scene.add(this.mesh);

      this.renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.container.appendChild(this.renderer.domElement);

      document.addEventListener("mousemove", this.onDocumentMouseMove, false);
      window.addEventListener("resize", this.onWindowResize, false);

      this.btnInit();
    },
    btnInit() {
      $("#startBtn").css(
        "left",
        ($("#cloud").width() - $("#startBtn").width()) / 2
      );
      $("#startBtn").css(
        "top",
        ($("#cloud").height() - $("#startBtn").height() / 2) / 2 - 50
      );
    },
    onWindowResize(event) {
      this.btnInit();
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    onDocumentMouseMove(event) {
      this.mouseX = (event.clientX - this.windowHalfX) * 0.25;
      this.mouseY = (event.clientY - this.windowHalfY) * 0.15;
    },
    animate() {
      requestAnimationFrame(this.animate);

      this.position = ((Date.now() - this.start_time) * 0.03) % 8000;

      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.1;
      this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.1;
      this.camera.position.z = -this.position + 8000;

      //console.log(camera.position);

      this.renderer.render(this.scene, this.camera);
    },
    JumpTo() {
      this.$router.push({ path: "./mapIndex" });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.startBtn {
  width: 200px;
  height: 50px;
  color: #fff;
  border-radius: 25px;
  background: #0094ff;
  text-align: center;
  line-height: 45px;
  font-size: 30px;
  position: absolute;
  /* left: 42%;
  top: 40%; */
  z-index: 111;
  cursor: pointer;
}
</style>
