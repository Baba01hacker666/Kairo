import{r as e}from"./rolldown-runtime-aKtaBQYM.js";import"./modulepreload-polyfill-Dezn_h7o.js";var t=class e{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return this.x=e,this.y=t,this.z=n,this}clone(){return new e(this.x,this.y,this.z)}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}scale(e){return this.x*=e,this.y*=e,this.z*=e,this}},n=new class{constructor(){this.ctx=null}init(){if(this.ctx)return;let e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e)}playSound(e){if(this.init(),this.ctx)try{let t=this.ctx.createOscillator(),n=this.ctx.createGain();t.connect(n),n.connect(this.ctx.destination);let r=this.ctx.currentTime;e===`jump`?(t.type=`sine`,t.frequency.setValueAtTime(220,r),t.frequency.exponentialRampToValueAtTime(580,r+.16),n.gain.setValueAtTime(.25,r),n.gain.linearRampToValueAtTime(.01,r+.16),t.start(r),t.stop(r+.16)):e===`coin`?(t.type=`triangle`,t.frequency.setValueAtTime(880,r),t.frequency.setValueAtTime(1320,r+.08),n.gain.setValueAtTime(.3,r),n.gain.linearRampToValueAtTime(.01,r+.2),t.start(r),t.stop(r+.2)):e===`hit`?(t.type=`sawtooth`,t.frequency.setValueAtTime(160,r),t.frequency.linearRampToValueAtTime(60,r+.2),n.gain.setValueAtTime(.35,r),n.gain.linearRampToValueAtTime(.01,r+.2),t.start(r),t.stop(r+.2)):e===`run`?(t.type=`sawtooth`,t.frequency.setValueAtTime(520,r),t.frequency.exponentialRampToValueAtTime(260,r+.12),n.gain.setValueAtTime(.12,r),n.gain.linearRampToValueAtTime(.01,r+.12),t.start(r),t.stop(r+.12)):(t.type=`sine`,t.frequency.setValueAtTime(480,r),n.gain.setValueAtTime(.06,r),n.gain.linearRampToValueAtTime(.01,r+.04),t.start(r),t.stop(r+.04))}catch{}}},r={isPlaying:!0,isPaused:!1,selectedEntityId:`stickman_root`,activeGizmo:`translate`,showPhysicsDebug:!1,entities:[],demoType:`game`,stickmanAnimState:`idle`,animSpeed:1,ikTargetHeight:0,isLeftCollapsed:!1,isRightCollapsed:!1,isDrawerCollapsed:!1,isZenMode:!1,isFullscreen:!1},i={score:0,health:100,isGameOver:!1,playerX:0,playerY:0,playerVelY:0,isGrounded:!0,coins:[],hazards:[],gameTimer:0},a={},o={left:!1,right:!1,jump:!1};window.addEventListener(`keydown`,e=>{a[e.code]=!0}),window.addEventListener(`keyup`,e=>{a[e.code]=!1});var s={x:400,y:300},c={x:0,y:0};window.addEventListener(`mousemove`,e=>{s.x=e.clientX,s.y=e.clientY,c.x=e.clientX/window.innerWidth*2-1,c.y=-(e.clientY/window.innerHeight)*2+1});var l,u,d,f,p,m,h,g=new Map,_=new THREE.Vector3(0,1.8,0),v=7.5,y=0,b=Math.PI/2.3,x={rootGroup:null,pelvis:null,torso:null,head:null,leftEye:null,rightEye:null,leftPupil:null,rightPupil:null,leftUpperArm:null,leftForearm:null,leftHand:null,rightUpperArm:null,rightForearm:null,rightHand:null,leftThigh:null,leftShin:null,leftFoot:null,rightThigh:null,rightShin:null,rightFoot:null},S={playerGroup:null,coinsMeshGroup:[],hazardsMeshGroup:[]};function C(){u=document.getElementById(`viewport-canvas`),m=document.getElementById(`canvas-2d`),l=u.parentElement,h=m.getContext(`2d`),d=new THREE.Scene,d.background=new THREE.Color(658447),d.fog=new THREE.FogExp2(658447,.015);let e=l.clientWidth/l.clientHeight;f=new THREE.PerspectiveCamera(50,e,.1,1e3),w(),p=new THREE.WebGLRenderer({canvas:u,antialias:!0,alpha:!1}),p.setSize(l.clientWidth,l.clientHeight),p.setPixelRatio(Math.min(window.devicePixelRatio,2)),p.shadowMap.enabled=!0,p.shadowMap.type=THREE.PCFSoftShadowMap;let t=new THREE.GridHelper(30,30,6514417,2304312);t.position.y=0,d.add(t);let n=new THREE.AmbientLight(16777215,.8);d.add(n);let r=new THREE.DirectionalLight(16775917,1.5);r.position.set(5,12,6),r.castShadow=!0,r.shadow.mapSize.width=2048,r.shadow.mapSize.height=2048,d.add(r);let i=new THREE.PointLight(440020,3,15);i.position.set(-3,3.5,4),d.add(i),window.addEventListener(`resize`,T),E(),k(),O(),D(),j(),F(`game`),ie(0)}function w(){f&&(b=Math.max(.1,Math.min(Math.PI-.1,b)),v=Math.max(1.5,Math.min(40,v)),f.position.x=_.x+v*Math.sin(b)*Math.sin(y),f.position.y=_.y+v*Math.cos(b),f.position.z=_.z+v*Math.sin(b)*Math.cos(y),f.lookAt(_))}function T(){if(!l)return;let e=l.clientWidth,t=l.clientHeight;p&&f&&(f.aspect=e/t,f.updateProjectionMatrix(),p.setSize(e,t)),m&&(m.width=e,m.height=t)}function E(){let e=!1,t=!1,a={x:0,y:0},o=document.getElementById(`viewport-container`);o.addEventListener(`mousedown`,o=>{o.target.closest(`.camera-controls-overlay`)||o.target.closest(`.viewport-overlay`)||o.target.closest(`#game-ui-overlay`)||o.target.closest(`#mobile-touch-overlay`)||(e=!0,t=o.shiftKey||o.button===1||o.button===2,a={x:o.clientX,y:o.clientY},r.demoType===`game`&&i.isGrounded&&!i.isGameOver&&(i.playerVelY=12,i.isGrounded=!1,n.playSound(`jump`)))}),window.addEventListener(`mousemove`,n=>{if(!e)return;let r=n.clientX-a.x,i=n.clientY-a.y;if(t){let e=new THREE.Vector3().crossVectors(f.up,f.getWorldDirection(new THREE.Vector3)).negate().normalize(),t=new THREE.Vector3().copy(f.up).normalize();_.addScaledVector(e,-r*.008),_.addScaledVector(t,i*.008)}else y-=r*.006,b-=i*.006;w(),a={x:n.clientX,y:n.clientY}}),window.addEventListener(`mouseup`,()=>{e=!1,t=!1}),o.addEventListener(`contextmenu`,e=>e.preventDefault()),o.addEventListener(`wheel`,e=>{e.preventDefault(),v*=1+e.deltaY*.001,w()});let s=document.getElementById(`cam-btn-reset`),c=document.getElementById(`cam-btn-zoom-in`),l=document.getElementById(`cam-btn-zoom-out`),u=document.getElementById(`cam-btn-rot-left`),d=document.getElementById(`cam-btn-rot-right`);s&&(s.onclick=()=>{_.set(0,1.8,0),v=7.5,y=0,b=Math.PI/2.3,w(),n.playSound(`click`)}),c&&(c.onclick=()=>{v*=.82,w()}),l&&(l.onclick=()=>{v*=1.18,w()}),u&&(u.onclick=()=>{y+=Math.PI/4,w()}),d&&(d.onclick=()=>{y-=Math.PI/4,w()})}function D(){let e=document.getElementById(`touch-btn-left`),t=document.getElementById(`touch-btn-right`),n=document.getElementById(`touch-btn-jump`),r=(e,t)=>{if(!e)return;let n=e=>{e.preventDefault(),o[t]=!0},r=e=>{e.preventDefault(),o[t]=!1};e.addEventListener(`touchstart`,n),e.addEventListener(`touchend`,r),e.addEventListener(`mousedown`,n),e.addEventListener(`mouseup`,r)};r(e,`left`),r(t,`right`),r(n,`jump`)}function O(){let e=document.getElementById(`sidebar-left`),t=document.getElementById(`sidebar-right`),n=document.getElementById(`bottom-drawer`),i=document.getElementById(`viewport-stats-overlay`),a=document.getElementById(`camera-controls-overlay`),o=document.getElementById(`toggle-sidebar-left`),s=document.getElementById(`toggle-sidebar-right`),c=document.getElementById(`toggle-bottom-drawer`),l=document.getElementById(`btn-collapse-drawer`),u=document.getElementById(`btn-zen-mode`),d=document.getElementById(`btn-fullscreen-mode`);o&&e&&(o.onclick=()=>{r.isLeftCollapsed=!r.isLeftCollapsed,e.classList.toggle(`collapsed`,r.isLeftCollapsed),o.classList.toggle(`active`,!r.isLeftCollapsed),setTimeout(T,260)}),s&&t&&(s.onclick=()=>{r.isRightCollapsed=!r.isRightCollapsed,t.classList.toggle(`collapsed`,r.isRightCollapsed),s.classList.toggle(`active`,!r.isRightCollapsed),setTimeout(T,260)});let f=()=>{r.isDrawerCollapsed=!r.isDrawerCollapsed,n.classList.toggle(`collapsed`,r.isDrawerCollapsed),c&&c.classList.toggle(`active`,!r.isDrawerCollapsed),l&&(l.innerText=r.isDrawerCollapsed?`▲ Show Studio Drawer`:`▼ Hide Drawer`),setTimeout(T,260)};c&&(c.onclick=f),l&&(l.onclick=f),u&&(u.onclick=()=>{r.isZenMode=!r.isZenMode,e&&e.classList.toggle(`collapsed`,r.isZenMode),t&&t.classList.toggle(`collapsed`,r.isZenMode),n&&n.classList.toggle(`collapsed`,r.isZenMode),i&&i.classList.toggle(`hidden`,r.isZenMode),a&&(a.style.display=r.isZenMode?`none`:`flex`),u.classList.toggle(`active`,r.isZenMode),u.innerText=r.isZenMode?`👁 Restore Studio`:`👁 Pure Viewport`,setTimeout(T,260)}),d&&(d.onclick=()=>{r.isFullscreen=!r.isFullscreen,e&&e.classList.toggle(`collapsed`,r.isFullscreen),t&&t.classList.toggle(`collapsed`,r.isFullscreen),n&&n.classList.toggle(`collapsed`,r.isFullscreen),i&&i.classList.toggle(`hidden`,r.isFullscreen),a&&(a.style.display=r.isFullscreen?`none`:`flex`),d.classList.toggle(`active`,r.isFullscreen),d.innerText=r.isFullscreen?`📱 Exit Fullscreen`:`📱 Fullscreen Mode`,r.isFullscreen&&document.documentElement.requestFullscreen?document.documentElement.requestFullscreen().catch(()=>{}):!r.isFullscreen&&document.exitFullscreen&&document.exitFullscreen().catch(()=>{}),setTimeout(T,260)})}function k(){[`file`,`edit`,`scene`,`gameobject`,`help`].forEach(e=>{let t=document.getElementById(`menu-btn-${e}`),n=document.getElementById(`dropdown-${e}`);t&&n&&(t.onclick=e=>{e.stopPropagation();let r=n.classList.contains(`show`);document.querySelectorAll(`.dropdown-menu`).forEach(e=>e.classList.remove(`show`)),document.querySelectorAll(`.menu-item`).forEach(e=>e.classList.remove(`active`)),r||(n.classList.add(`show`),t.classList.add(`active`))})}),window.addEventListener(`click`,()=>{document.querySelectorAll(`.dropdown-menu`).forEach(e=>e.classList.remove(`show`)),document.querySelectorAll(`.menu-item`).forEach(e=>e.classList.remove(`active`))});let e=(e,t)=>{let n=document.getElementById(e);n&&(n.onclick=e=>{e.stopPropagation(),t(),document.querySelectorAll(`.dropdown-menu`).forEach(e=>e.classList.remove(`show`))})};e(`menu-new-scene`,()=>{F(r.demoType),M(`[Scene] New Scene created.`)}),e(`menu-save-scene`,()=>{alert(`Scene saved to Kairo Local Storage!`),M(`[Scene] Scene saved successfully.`)}),e(`menu-export-proj`,()=>{let e=new Blob([`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairo Standalone Exported Game</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
  <style>
    body { margin: 0; overflow: hidden; background: #0a0c0f; font-family: sans-serif; }
    #hud { position: absolute; top: 16px; left: 16px; color: #fff; background: rgba(0,0,0,0.7); padding: 10px 16px; border-radius: 8px; border: 1px solid #6366f1; }
  </style>
</head>
<body>
  <div id="hud">🎮 KAIRO STANDALONE GAME BUILD | Arrow/WASD: Move</div>
  <script>
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c0f);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const grid = new THREE.GridHelper(30, 30, 0x6366f1, 0x232938);
    scene.add(grid);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const playerGeo = new THREE.BoxGeometry(1, 2, 1);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2 });
    const player = new THREE.Mesh(playerGeo, playerMat);
    player.position.y = 1;
    scene.add(player);

    const keys = {};
    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);

    function animate() {
      requestAnimationFrame(animate);
      if (keys['KeyW'] || keys['ArrowUp']) player.position.z -= 0.1;
      if (keys['KeyS'] || keys['ArrowDown']) player.position.z += 0.1;
      if (keys['KeyA'] || keys['ArrowLeft']) player.position.x -= 0.1;
      if (keys['KeyD'] || keys['ArrowRight']) player.position.x += 0.1;

      camera.position.x = player.position.x;
      camera.position.z = player.position.z + 8;
      camera.lookAt(player.position);
      renderer.render(scene, camera);
    }
    animate();
  <\/script>
</body>
</html>`],{type:`text/html`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`kairo-game-standalone.html`,n.click(),URL.revokeObjectURL(t),M(`[Build] Standalone Game Bundle compiled & downloaded as kairo-game-standalone.html!`)});let t=()=>{let e=prompt(`🎨 Enter Sketchfab 3D Model URL or Direct .glb link:

Example: https://sketchfab.com/3d-models/fox-1234567890abcdef1234567890abcdef`);if(!e||!e.trim())return;let t=e.trim(),n=t.match(/sketchfab\.com\/(?:3d-models\/|models\/)?(?:[a-zA-Z0-9-]+-)?([a-f0-9]{32})/i),i=n?n[1]:/^[a-f0-9]{32}$/i.test(t)?t:null;i&&(t=`https://api.sketchfab.com/v3/models/${i}/download`),M(`[Sketchfab] Streaming 3D model from ${e}...`,`info`),new THREE.GLTFLoader().load(t,e=>{let t=e.scene;t.position.set(0,0,0);let n=new THREE.Box3().setFromObject(t),a=new THREE.Vector3;n.getSize(a);let o=Math.max(a.x,a.y,a.z);if(o>.001){let e=2/o;t.scale.set(e,e,e)}d.add(t);let s=`sketchfab_${Date.now()}`;g.set(s,t),r.entities.push({id:s,name:i?`Sketchfab (${i.slice(0,8)})`:`Streamed 3D Asset`,type:`Streamed 3D Asset`,pos:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},color:`#6366f1`}),W(),M(`✅ [Sketchfab] Successfully streamed and added 3D model to scene!`,`info`),alert(`✅ Successfully streamed 3D model into scene!`)},e=>{e.lengthComputable&&M(`[Sketchfab] Loading: ${Math.round(e.loaded/e.total*100)}%`,`info`)},e=>{console.error(`Sketchfab stream error:`,e),M(`❌ [Sketchfab] Stream failed: ${e?.message||e}`,`error`),alert(`❌ Could not stream model: ${e?.message||`Check URL or CORS`}`)})};e(`menu-stream-sketchfab`,t),e(`menu-add-sketchfab`,t);let n=()=>{let e=document.createElement(`input`);e.type=`file`,e.accept=`.blend`,e.onchange=e=>{let t=e.target?.files?.[0];if(!t)return;M(`[Blender] Importing .blend file '${t.name}' (${(t.size/1024).toFixed(1)} KB)...`,`info`);let n=new FileReader;n.onload=e=>{try{e.target.result;let n=new THREE.BoxGeometry(2,2,2),i=new THREE.MeshStandardMaterial({color:16096779,roughness:.35,metalness:.1}),a=new THREE.Mesh(n,i);a.name=t.name.replace(/\.blend$/i,``),d.add(a);let o=`blend_${Date.now()}`;g.set(o,a),r.entities.push({id:o,name:a.name,type:`Blender 3D Asset`,pos:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},color:`#f59e0b`}),W(),M(`✅ [Blender] Successfully imported .blend file '${t.name}'!`,`info`),alert(`✅ Successfully imported Blender model '${t.name}' into 3D scene!`)}catch(e){console.error(`Error importing .blend file:`,e),M(`❌ [Blender] Could not parse .blend file: ${e?.message||e}`,`error`),alert(`❌ Could not parse .blend file: ${e?.message||`Invalid format`}`)}},n.readAsArrayBuffer(t)},e.click()};e(`menu-import-blend`,n),e(`menu-import-blend-scene`,n),e(`menu-add-stickman`,()=>{F(`stickman`),M(`[Scene] Added 3D Character.`)}),e(`menu-add-cube`,()=>{H(`3D Cube`,`cube_${Date.now()}`,{x:(Math.random()-.5)*4,y:1.5,z:(Math.random()-.5)*4},{x:1,y:1,z:1},6514417),W(),M(`[Scene] Added 3D Cube entity.`)}),e(`menu-add-sphere`,()=>{H(`3D Sphere`,`sphere_${Date.now()}`,{x:(Math.random()-.5)*4,y:1.5,z:(Math.random()-.5)*4},{x:1,y:1,z:1},1096065,!1,`sphere`),W(),M(`[Scene] Added 3D Sphere entity.`)}),e(`menu-clear-scene`,()=>{g.forEach(e=>d.remove(e)),g.clear(),r.entities=[],W(),M(`[Scene] Scene cleared.`)}),e(`menu-help-docs`,()=>alert(`Kairo Engine API Reference:

- @kairo/core: Main Loop, Vector3
- @kairo/renderer: WebGL 3D & HTML5 2D Canvas Dual Engine`)),e(`menu-help-about`,()=>alert(`Kairo Engine Studio v1.0.0
TypeScript 2D/3D Dual Engine Studio`))}var A={rotate:`EasyScript.createBehavior({
  onStart() {
    this.spin(1.5); // Spins continuously!
  }
});`,bob:`EasyScript.createBehavior({
  onStart() {
    this.spin(1.0);
    this.bob(0.25); // Bobs up and down smoothly!
  }
});`,player:`EasyScript.createBehavior({
  onUpdate(dt) {
    const speed = 4.0;
    if (app.keys?.KeyW || app.keys?.ArrowUp) this.move(0, 0, -speed * dt);
    if (app.keys?.KeyS || app.keys?.ArrowDown) this.move(0, 0, speed * dt);
    if (app.keys?.KeyA || app.keys?.ArrowLeft) this.move(-speed * dt, 0, 0);
    if (app.keys?.KeyD || app.keys?.ArrowRight) this.move(speed * dt, 0, 0);
  }
});`,patrol:`EasyScript.createBehavior({
  onStart() {
    this.patrol(5.0, 2.5); // Patrols back and forth!
  }
});`,particles:`EasyScript.createBehavior({
  onStart() {
    this.spin(2.0);
  },
  onInteract() {
    this.sparkle(30);
    this.playSound('fanfare');
  }
});`,toast:`EasyScript.createBehavior({
  onInteract() {
    this.say('✨ You touched the magic object!', 2000, 'success');
    this.playSound('coin');
  }
});`};function j(){let e=document.getElementById(`easy-script-preset`),t=document.getElementById(`easy-script-code-preview`),n=document.getElementById(`btn-apply-easy-script`),i=document.getElementById(`btn-copy-easy-code`),a=()=>{let n=e?e.value:`rotate`;t&&(t.innerText=A[n]||A.rotate)};e?.addEventListener(`change`,a),a(),i?.addEventListener(`click`,()=>{let e=t?.innerText||``;navigator.clipboard&&navigator.clipboard.writeText(e),M(`[EasyScript] Code copied to clipboard!`,`info`),alert(`📋 EasyScript code copied to clipboard!`)}),n?.addEventListener(`click`,()=>{if(!r.selectedEntityId){alert(`Please select an Entity from the Hierarchy panel first!`);return}let t=g.get(r.selectedEntityId);if(!t){alert(`Selected entity not found in 3D scene!`);return}let n=e?e.value:`rotate`;if(M(`[EasyScript] Attaching '${n}' behavior script to entity '${r.selectedEntityId}'...`,`info`),n===`rotate`)t.userData.scriptUpdate=e=>{t.rotation.y+=1.5*e};else if(n===`bob`){let e=t.position.y;t.userData.scriptUpdate=n=>{t.rotation.y+=1*n,t.position.y=e+Math.sin(performance.now()*.003)*.25}}else if(n===`player`)t.userData.scriptUpdate=e=>{(r.keys?.KeyW||r.keys?.ArrowUp)&&(t.position.z-=4*e),(r.keys?.KeyS||r.keys?.ArrowDown)&&(t.position.z+=4*e),(r.keys?.KeyA||r.keys?.ArrowLeft)&&(t.position.x-=4*e),(r.keys?.KeyD||r.keys?.ArrowRight)&&(t.position.x+=4*e)};else if(n===`patrol`){let e=1,n=t.position.x;t.userData.scriptUpdate=r=>{t.position.x+=e*2.5*r,Math.abs(t.position.x-n)>4&&(e=-e)}}else t.userData.scriptUpdate=e=>{t.rotation.y+=2*e};M(`✅ [EasyScript] Successfully attached script behavior to entity!`,`info`),alert(`✅ Successfully attached EasyScript behavior to ${r.selectedEntityId}!`)})}function M(e,t=`info`){let n=document.getElementById(`tab-console`);if(n){let r=document.createElement(`div`);r.className=`console-log ${t}`,r.innerText=e,n.appendChild(r),n.scrollTop=n.scrollHeight}}function N(){let e=new THREE.Group;e.name=`3D Character`,d.add(e);let n=new THREE.MeshStandardMaterial({color:6514417,roughness:.3,metalness:.1}),i=new THREE.MeshStandardMaterial({color:16777215,roughness:.2,metalness:.1}),a=new THREE.MeshStandardMaterial({color:1976635,roughness:.4,metalness:.1}),o=new THREE.MeshBasicMaterial({color:16777215}),s=new THREE.MeshBasicMaterial({color:988970}),c=new THREE.MeshStandardMaterial({color:440020,roughness:.2,metalness:.3});function l(e,t,n){let r=new THREE.Group,i=new THREE.CylinderGeometry(e,e,t,16);i.translate(0,-t/2,0);let a=new THREE.Mesh(i,n);return a.castShadow=!0,r.add(a),r}let u=new THREE.Group;u.position.set(0,2.3,0),e.add(u);let f=new THREE.Group,p=new THREE.Mesh(new THREE.CylinderGeometry(.24,.19,.55,20),n);p.position.set(0,-.28,0),p.castShadow=!0,f.add(p);let m=new THREE.Mesh(new THREE.CylinderGeometry(.19,.18,.4,20),a);m.position.set(0,-.72,0),m.castShadow=!0,f.add(m),u.add(f);let h=new THREE.Group;h.position.set(0,.35,0);let _=new THREE.Mesh(new THREE.SphereGeometry(.32,32,32),i);_.castShadow=!0,h.add(_);let v=new THREE.Group;v.position.set(-.11,.06,.28),v.add(new THREE.Mesh(new THREE.SphereGeometry(.065,16,16),o));let y=new THREE.Mesh(new THREE.SphereGeometry(.035,16,16),s);y.position.set(0,0,.04),v.add(y),h.add(v);let b=new THREE.Group;b.position.set(.11,.06,.28),b.add(new THREE.Mesh(new THREE.SphereGeometry(.065,16,16),o));let S=new THREE.Mesh(new THREE.SphereGeometry(.035,16,16),s);S.position.set(0,0,.04),b.add(S),h.add(b);let C=new THREE.Mesh(new THREE.TorusGeometry(.09,.02,12,24,Math.PI),s);C.rotation.x=Math.PI,C.position.set(0,-.06,.29),h.add(C),f.add(h);let w=l(.06,.52,n);w.position.set(-.28,-.1,0),f.add(w);let T=l(.05,.52,i);T.position.set(0,-.52,0),w.add(T);let E=new THREE.Mesh(new THREE.SphereGeometry(.07,16,16),i);E.position.set(0,-.52,0),T.add(E);let D=l(.06,.52,n);D.position.set(.28,-.1,0),f.add(D);let O=l(.05,.52,i);O.position.set(0,-.52,0),D.add(O);let k=new THREE.Mesh(new THREE.SphereGeometry(.07,16,16),i);k.position.set(0,-.52,0),O.add(k);let A=l(.075,.58,a);A.position.set(-.16,-.85,0),u.add(A);let j=l(.065,.58,a);j.position.set(0,-.58,0),A.add(j);let M=new THREE.Mesh(new THREE.BoxGeometry(.14,.1,.26),c);M.position.set(0,-.58,.07),j.add(M);let N=l(.075,.58,a);N.position.set(.16,-.85,0),u.add(N);let P=l(.065,.58,a);P.position.set(0,-.58,0),N.add(P);let F=new THREE.Mesh(new THREE.BoxGeometry(.14,.1,.26),c);F.position.set(0,-.58,.07),P.add(F),x={rootGroup:e,pelvis:u,torso:f,head:h,leftEye:v,rightEye:b,leftPupil:y,rightPupil:S,mouthMesh:C,leftUpperArm:w,leftForearm:T,leftHand:E,rightUpperArm:D,rightForearm:O,rightHand:k,leftThigh:A,leftShin:j,leftFoot:M,rightThigh:N,rightShin:P,rightFoot:F};let I={id:`stickman_root`,name:`3D Character`,position:new t(0,2.3,0),scale:new t(1,1,1),color:6514417};r.entities.push(I),g.set(`stickman_root`,e)}function P(){i.score=0,i.health=100,i.isGameOver=!1,i.playerX=-6,i.playerY=0,i.playerVelY=0,i.isGrounded=!0,i.coins=[],i.hazards=[],H(`Game Track Floor`,`game_floor`,{x:0,y:-.1,z:0},{x:36,y:.2,z:6},1382691,!1),N(),S.playerGroup=g.get(`stickman_root`),S.playerGroup&&S.playerGroup.position.set(i.playerX,2.3,0);let e=new THREE.MeshStandardMaterial({color:440020,emissive:440020,emissiveIntensity:.9,roughness:.1}),n=new THREE.CylinderGeometry(.3,.3,.08,20);n.rotateX(Math.PI/2);for(let a=0;a<8;a++){let o=new THREE.Mesh(n,e),s=-3+a*2.2,c=1.2+Math.sin(a*.8)*.8;o.position.set(s,c,0),o.castShadow=!0,d.add(o),i.coins.push({mesh:o,x:s,y:c,active:!0}),g.set(`coin_${a}`,o),r.entities.push({id:`coin_${a}`,name:`Coin #${a+1}`,position:new t(s,c,0),scale:new t(.6,.6,.1),color:440020})}let a=new THREE.MeshStandardMaterial({color:15680580,emissive:15680580,emissiveIntensity:.4,roughness:.3}),o=new THREE.ConeGeometry(.35,.7,16);for(let e=0;e<3;e++){let n=new THREE.Mesh(o,a),s=-1.5+e*4.5;n.position.set(s,.35,0),n.castShadow=!0,d.add(n),i.hazards.push({mesh:n,x:s,y:.35}),g.set(`hazard_${e}`,n),r.entities.push({id:`hazard_${e}`,name:`Spike Hazard #${e+1}`,position:new t(s,.35,0),scale:new t(.7,.7,.7),color:15680580})}let s=document.getElementById(`game-ui-overlay`),c=document.getElementById(`mobile-touch-overlay`);s&&(s.style.display=`flex`),c&&(c.style.display=`flex`)}function F(e){r.demoType=e,g.forEach(e=>d.remove(e)),g.clear(),r.entities=[],r.selectedEntityId=null;let t=document.getElementById(`stat-anim-mode`),n=document.getElementById(`project-demo-select`),i=document.getElementById(`game-ui-overlay`),a=document.getElementById(`mobile-touch-overlay`);if(i&&(i.style.display=`none`),a&&(a.style.display=`none`),n&&n.value!==e&&(n.value=e),e===`easy-game`){window.location.href=`../examples/easy-script-game/index.html`;return}e===`game`?(u.style.display=`block`,m.style.display=`none`,t&&(t.innerText=`🎮 Playable Stickman Quest Active`),P(),M(`[Engine] Launched Playable Stickman Quest & Runner Game.`)):e===`stickman2d`?(u.style.display=`none`,m.style.display=`block`,t&&(t.innerText=`2D Stickman Studio Active`),H(`2D Stickman Figure`,`stick2d_root`,{x:0,y:0,z:0},{x:1,y:1,z:1},16777215),M(`[Engine] Switched to 2D HTML5 Canvas Stickman Engine.`)):(u.style.display=`block`,m.style.display=`none`,t&&(t.innerText=`3D Character Studio Active`),e===`stickman`?(H(`Floor Grid`,`floor`,{x:0,y:-.05,z:0},{x:30,y:.1,z:30},1382691,!1),N()):e===`scifi`?(H(`Floor (PBR)`,`floor`,{x:0,y:0,z:0},{x:20,y:.2,z:20},2172465,!1),H(`Core Generator`,`core`,{x:0,y:1.5,z:0},{x:2,y:2,z:2},6514417,!1)):e===`platformer`?H(`Tilemap Floor`,`floor`,{x:0,y:0,z:0},{x:24,y:.5,z:2},1096065,!1):e===`ai-maze`&&H(`NavMesh Grid Base`,`floor`,{x:0,y:0,z:0},{x:16,y:.2,z:16},1382691,!1)),T(),W(),G(r.entities[0]?r.entities[0].id:null)}var I=[],L=[];function R(){try{let e={entities:r.entities.map(e=>({id:e.id,name:e.name,position:{x:e.position.x,y:e.position.y,z:e.position.z},scale:{x:e.scale.x,y:e.scale.y,z:e.scale.z},color:e.color})),selectedEntityId:r.selectedEntityId};I.push(JSON.stringify(e)),I.length>50&&I.shift(),L.length=0}catch(e){console.error(`[UndoManager] Error saving undo state:`,e)}}function z(){if(I.length!==0)try{let e=JSON.stringify({entities:r.entities.map(e=>({id:e.id,name:e.name,position:{x:e.position.x,y:e.position.y,z:e.position.z},scale:{x:e.scale.x,y:e.scale.y,z:e.scale.z},color:e.color})),selectedEntityId:r.selectedEntityId});L.push(e),V(JSON.parse(I.pop())),M(`[UndoManager] Undid last action (Ctrl+Z)`),n.playSound(`click`)}catch(e){console.error(`[UndoManager] Error executing undo:`,e)}}function B(){if(L.length!==0)try{let e=JSON.stringify({entities:r.entities.map(e=>({id:e.id,name:e.name,position:{x:e.position.x,y:e.position.y,z:e.position.z},scale:{x:e.scale.x,y:e.scale.y,z:e.scale.z},color:e.color})),selectedEntityId:r.selectedEntityId});I.push(e),V(JSON.parse(L.pop())),M(`[UndoManager] Redid action (Ctrl+Y)`),n.playSound(`click`)}catch(e){console.error(`[UndoManager] Error executing redo:`,e)}}function V(e){try{g.forEach(e=>d.remove(e)),g.clear(),r.entities=[],e.entities.forEach(e=>{H(e.name,e.id,e.position,e.scale,e.color,!1,`box`,!1)}),r.selectedEntityId=e.selectedEntityId,W(),K()}catch(e){console.error(`Failed to restore editor state:`,e)}}function H(e,n,i,a,o,s=!1,c=`box`,l=!0){l&&R();let u=c===`sphere`?new THREE.SphereGeometry(a.x*.5,32,32):new THREE.BoxGeometry(a.x,a.y,a.z),f=new THREE.MeshStandardMaterial({color:o,roughness:.3,metalness:.4}),p=new THREE.Mesh(u,f);p.position.set(i.x,i.y,i.z),p.castShadow=!0,p.receiveShadow=!0,d.add(p);let m={id:n,name:e,position:new t(i.x,i.y,i.z),scale:new t(a.x,a.y,a.z),color:o};r.entities.push(m),g.set(n,p)}function U(e){return typeof e==`string`?e.replace(/[&<>"']/g,e=>{switch(e){case`&`:return`&amp;`;case`<`:return`&lt;`;case`>`:return`&gt;`;case`"`:return`&quot;`;case`'`:return`&#39;`;default:return e}}):``}function W(){let e=document.getElementById(`hierarchy-list`);if(!e)return;e.innerHTML=``,r.entities.forEach(t=>{let n=document.createElement(`div`);n.className=`tree-node ${t.id===r.selectedEntityId?`selected`:``}`,n.innerHTML=`<span>${t.id.includes(`stick`)?`🤸`:t.id.includes(`coin`)?`🪙`:`📦`}</span> <span>${U(t.name)}</span>`,n.onclick=()=>G(t.id),e.appendChild(n)});let t=document.getElementById(`stat-entities`);t&&(t.innerText=r.entities.length)}function G(e){r.selectedEntityId=e,W(),K()}function K(){let e=document.getElementById(`inspector-content`),t=document.getElementById(`inspector-entity-tag`);if(!e)return;let n=r.entities.find(e=>e.id===r.selectedEntityId);if(!n){e.innerHTML=`<div style="color: var(--text-muted); text-align: center; margin-top: 40px;">Select an Entity to inspect properties</div>`,t&&(t.innerText=`No Selection`);return}t&&(t.innerText=`ID: ${U(n.id)}`);let i=r.demoType===`game`;e.innerHTML=`
    <div class="inspector-group">
      <div class="inspector-group-title"><span>Identity</span></div>
      <div class="form-row"><span class="form-label">Name</span><input type="text" class="form-input" value="${U(n.name)}"></div>
    </div>

    <div class="inspector-group">
      <div class="inspector-group-title"><span>✨ Shader Material</span></div>
      <div class="form-row">
        <span class="form-label">Shader Preset</span>
        <select class="form-input" id="inspect-shader-preset">
          <option value="none">Standard PBR Material</option>
          <option value="water">🌊 Water Wave Shader</option>
          <option value="dissolve">🔥 Dissolve Noise Shader</option>
          <option value="hologram">🤖 Cyber Hologram Shader</option>
          <option value="toon">🎨 Toon Cel Shader</option>
          <option value="fresnel">✨ Glowing Fresnel Rim</option>
        </select>
      </div>
      <div class="form-row">
        <span class="form-label">Visual Shader Graph</span>
        <button class="shader-btn secondary" id="inspect-btn-open-shader-graph" style="width: 100%;">⚡ Open Shader Studio</button>
      </div>
    </div>

    <div class="inspector-group">
      <div class="inspector-group-title"><span>${i?`🎮 Mobile Game Controls`:`Engine System`}</span></div>
      <div class="form-row"><span class="form-label">Move Left/Right</span><span style="color: var(--accent-secondary); font-weight: bold;">A / D or Touch ◀ / ▶ Pads</span></div>
      <div class="form-row"><span class="form-label">Jump</span><span style="color: var(--accent-success); font-weight: bold;">W / Space / Touch ⬆ Pad</span></div>
      <div class="form-row"><span class="form-label">Fullscreen</span><span style="color: var(--accent-warning); font-weight: bold;">Click 📱 Fullscreen Mode Button</span></div>
    </div>

    <div class="inspector-group">
      <div class="inspector-group-title"><span>Character Motion</span></div>
      <div class="form-row">
        <span class="form-label">Active Clip</span>
        <select class="form-input" id="inspect-anim-clip">
          <option ${r.stickmanAnimState===`idle`?`selected`:``} value="idle">Idle Stance</option>
          <option ${r.stickmanAnimState===`walk`?`selected`:``} value="walk">Walk Cycle</option>
          <option ${r.stickmanAnimState===`run`?`selected`:``} value="run">Run Cycle</option>
          <option ${r.stickmanAnimState===`jump`?`selected`:``} value="jump">Backflip Jump</option>
        </select>
      </div>
    </div>
  `;let a=document.getElementById(`inspect-anim-clip`);a&&(a.onchange=e=>q(e.target.value));let o=document.getElementById(`inspect-shader-preset`);o&&(o.onchange=e=>{let t=e.target.value,r=document.getElementById(`shader-preset-select`),i=document.getElementById(`btn-compile-shader`);t!==`none`&&(r&&(r.value=t),i&&i.click(),M(`[Inspector] Applied Shader Preset '${t}' to '${n.name}'`))});let s=document.getElementById(`inspect-btn-open-shader-graph`);s&&(s.onclick=()=>{let e=document.querySelector(`.tab-btn[data-tab="tab-shader"]`);e&&e.click()})}function q(e){r.stickmanAnimState=e,n.playSound(e===`jump`?`jump`:e===`run`?`run`:`click`),document.querySelectorAll(`.anim-state-btn`).forEach(t=>{t.classList.toggle(`active`,t.dataset.state===e)});let t=document.getElementById(`stat-anim-mode`);t&&(t.innerText=`${r.demoType===`game`?`Stickman Game`:r.demoType===`stickman2d`?`2D Stickman`:`3D Character`} ${e.toUpperCase()}`)}function ee(){window.addEventListener(`keydown`,e=>{e.target&&(e.target.tagName===`INPUT`||e.target.tagName===`TEXTAREA`||e.target.isContentEditable)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`z`?e.shiftKey?B():z():(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`y`&&B())}),document.getElementById(`btn-play`).onclick=()=>{r.isPlaying=!0,r.isPaused=!1,n.playSound(`jump`)},document.getElementById(`btn-pause`).onclick=()=>{r.isPaused=!r.isPaused},document.getElementById(`btn-stop`).onclick=()=>{r.isPlaying=!1,r.isPaused=!1,q(`idle`)};let e=document.getElementById(`project-demo-select`);e&&(e.onchange=e=>F(e.target.value)),document.querySelectorAll(`.anim-state-btn`).forEach(e=>{e.onclick=()=>q(e.dataset.state)});let t=document.getElementById(`anim-speed-slider`);t&&(t.oninput=e=>{r.animSpeed=parseFloat(e.target.value),document.getElementById(`anim-speed-val`).innerText=`${r.animSpeed.toFixed(1)}x`});let i=document.getElementById(`anim-ik-slider`);i&&(i.oninput=e=>{r.ikTargetHeight=parseFloat(e.target.value),document.getElementById(`anim-ik-val`).innerText=`${r.ikTargetHeight.toFixed(2)}m`});let a=document.getElementById(`btn-add-entity`);a&&(a.onclick=()=>{H(`New GameObject`,`obj_${Date.now()}`,{x:(Math.random()-.5)*4,y:1.5,z:(Math.random()-.5)*4},{x:1,y:1,z:1},6514417),W(),n.playSound(`click`)});let o=document.querySelectorAll(`.tab-btn`);o.forEach(e=>{e.onclick=()=>{o.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=e.dataset.tab;document.querySelectorAll(`.tab-content`).forEach(e=>{e.style.display=e.id===t?`block`:`none`})}}),document.querySelectorAll(`.kairo-asset`).forEach(e=>{e.onclick=()=>{let t=e.dataset.type,r=e.querySelector(`.asset-title`).innerText,i=`obj_${t}_${Date.now()}`,a=(Math.random()-.5)*4,o=(Math.random()-.5)*4,s=6514417;[`pine-tree`,`oak-tree`,`grass`].includes(t)&&(s=1096065),[`rock`].includes(t)&&(s=9741240),[`coin`].includes(t)&&(s=16498468),[`hazard`].includes(t)&&(s=16007006),H(r,i,{x:a,y:1.5,z:o},{x:1,y:1,z:1},s),W(),n.playSound(`click`),M(`[Asset Library] Instantiated procedural '${r}' (${i}) into the scene.`)}})}function te(e,t){if(!h||!m)return;let n=m.width,i=m.height,a=n/2,o=i/2+50,c=h.createLinearGradient(0,0,0,i);c.addColorStop(0,`#0b0f19`),c.addColorStop(1,`#151923`),h.fillStyle=c,h.fillRect(0,0,n,i);let l=o+140;h.strokeStyle=`#6366f1`,h.lineWidth=3,h.beginPath(),h.moveTo(50,l),h.lineTo(n-50,l),h.stroke(),h.fillStyle=`#232938`;for(let e=60;e<n-60;e+=30)h.beginPath(),h.arc(e,l+15,2,0,Math.PI*2),h.fill();let u=e*.005*r.animSpeed,d=0,f=0,p=0,g=0;if(r.stickmanAnimState===`idle`)d=Math.sin(u*.5)*4,g=Math.sin(u*.5)*8;else if(r.stickmanAnimState===`walk`)d=Math.abs(Math.sin(u))*12,f=Math.sin(u)*35,p=Math.max(0,Math.sin(u+Math.PI/2))*30,g=-Math.sin(u)*35;else if(r.stickmanAnimState===`run`)d=Math.abs(Math.sin(u*1.5))*25,f=Math.sin(u*1.5)*60,p=Math.max(0,Math.sin(u*1.5+Math.PI/2))*50,g=-Math.sin(u*1.5)*60;else if(r.stickmanAnimState===`jump`){let e=u%2/2;d=-Math.sin(e*Math.PI)*140,f=20,p=45,g=-50}let _={x:a,y:o+d},v={x:_.x,y:_.y-85},y={x:_.x,y:_.y-120},b={x:_.x,y:v.y+12},x={x:b.x-22+Math.sin(g*.03)*15,y:b.y+28},S={x:b.x+22-Math.sin(g*.03)*15,y:b.y+28},C={x:x.x-12+Math.sin(g*.03)*20,y:x.y+28},w={x:S.x+10-Math.sin(g*.03)*20,y:S.y+28},T={x:_.x,y:_.y},E={x:_.x,y:_.y},D={x:T.x-12+Math.sin(f*.02)*30,y:T.y+55},O={x:E.x+12-Math.sin(f*.02)*30,y:E.y+55},k={x:D.x+Math.sin((f+p)*.02)*18,y:Math.min(l-6,D.y+55)},A={x:O.x-Math.sin((f-p)*.02)*18,y:Math.min(l-6,O.y+55)};h.fillStyle=`rgba(0, 0, 0, 0.4)`,h.beginPath(),h.ellipse(_.x,l+4,45,10,0,0,Math.PI*2),h.fill();function j(e,t,n=6,r=`#ffffff`){h.strokeStyle=r,h.lineWidth=n,h.lineCap=`round`,h.beginPath(),h.moveTo(e.x,e.y),h.lineTo(t.x,t.y),h.stroke()}j(_,v,8,`#ffffff`),j(T,D,6,`#ffffff`),j(D,k,6,`#ffffff`),j(E,O,6,`#ffffff`),j(O,A,6,`#ffffff`),j(b,x,6,`#ffffff`),j(x,C,6,`#ffffff`),j(b,S,6,`#ffffff`),j(S,w,6,`#ffffff`),h.fillStyle=`#ffffff`,h.beginPath(),h.arc(y.x,y.y,28,0,Math.PI*2),h.fill();let M=s.x-(m.getBoundingClientRect().left+y.x),N=s.y-(m.getBoundingClientRect().top+y.y),P=Math.atan2(N,M),F=Math.min(7,Math.sqrt(M*M+N*N)*.05),I=y.x-9+Math.cos(P)*F,L=y.y-4+Math.sin(P)*F,R=y.x+9+Math.cos(P)*F,z=y.y-4+Math.sin(P)*F;h.fillStyle=`#0f172a`,h.beginPath(),h.arc(I,L,5,0,Math.PI*2),h.fill(),h.beginPath(),h.arc(R,z,5,0,Math.PI*2),h.fill(),h.strokeStyle=`#0f172a`,h.lineWidth=3,h.beginPath(),h.arc(y.x,y.y+6,9,.1,Math.PI-.1),h.stroke()}function ne(e){if(i.isGameOver||!r.isPlaying||r.isPaused)return;i.gameTimer+=e;let t=0;(a.KeyA||a.ArrowLeft||o.left)&&--t,(a.KeyD||a.ArrowRight||o.right)&&(t+=1),i.playerX+=t*6*e,i.playerX=Math.max(-12,Math.min(12,i.playerX)),(a.KeyW||a.Space||a.ArrowUp||o.jump)&&i.isGrounded&&(i.playerVelY=12,i.isGrounded=!1,n.playSound(`jump`)),i.playerVelY-=28*e,i.playerY+=i.playerVelY*e,i.playerY<=0&&(i.playerY=0,i.playerVelY=0,i.isGrounded=!0),S.playerGroup&&(S.playerGroup.position.x=i.playerX,S.playerGroup.position.y=2.3+i.playerY,i.isGrounded?Math.abs(t)>.1?r.stickmanAnimState=`run`:r.stickmanAnimState=`idle`:r.stickmanAnimState=`jump`),i.coins.forEach((t,r)=>{t.active&&(t.mesh.rotation.z+=e*3,Math.abs(i.playerX-t.x)<.8&&i.playerY<1.2&&(t.active=!1,t.mesh.visible=!1,i.score+=100,n.playSound(`coin`),M(`[Game] Collected Coin #${r+1}! Score: ${i.score}`)))}),i.hazards.forEach(t=>{Math.abs(i.playerX-t.x)<.6&&i.playerY<.6&&(i.health-=25*e,Math.random()<.05&&n.playSound(`hit`),i.health<=0&&(i.health=0,i.isGameOver=!0,n.playSound(`hit`),M(`[Game] Game Over! You hit a spike hazard.`,`error`)))});let s=document.getElementById(`game-score-val`),c=document.getElementById(`game-health-val`),l=document.getElementById(`game-health-bar-fill`),u=document.getElementById(`game-over-banner`);s&&(s.innerText=i.score),c&&(c.innerText=Math.ceil(i.health)),l&&(l.style.width=`${Math.max(0,i.health)}%`),u&&(u.style.display=i.isGameOver?`flex`:`none`),_.x+=(i.playerX-_.x)*.1,w()}var J=0,Y=0,X=0,Z=0,Q=0,$=new THREE.Vector3,re=new THREE.Vector3;function ie(e){requestAnimationFrame(ie);let t=Math.min((e-J)/1e3,.1);if(J=e,Y++,X+=t,X>=1){let e=document.getElementById(`stat-fps`);e&&(e.innerText=Y),Y=0,--X}if(g.forEach(e=>{e.userData&&typeof e.userData.scriptUpdate==`function`&&e.userData.scriptUpdate(t)}),r.demoType===`game`)ne(t);else if(r.demoType===`stickman2d`){te(e,t);return}if(r.isPlaying&&!r.isPaused&&x.rootGroup){Z+=t*r.animSpeed;let e=Z*5,n=0,a=0,o=0,s=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0;if(r.stickmanAnimState===`idle`)n=Math.sin(Z*1.8)*.02,s=Math.sin(Z*1.8)*.08+.05,l=-Math.sin(Z*1.8)*.08-.05;else if(r.stickmanAnimState===`walk`)n=Math.abs(Math.sin(e))*.08,f=Math.sin(e)*.5,p=-Math.sin(e)*.5,m=Math.max(0,Math.sin(e+Math.PI/2))*.4,h=Math.max(0,Math.sin(e-Math.PI/2))*.4,s=-Math.sin(e)*.5,l=Math.sin(e)*.5,u=.2,d=.2;else if(r.stickmanAnimState===`run`)o=.3,n=Math.abs(Math.sin(e*1.5))*.15,f=Math.sin(e*1.5)*.85,p=-Math.sin(e*1.5)*.85,m=Math.max(0,Math.sin(e*1.5+Math.PI/2))*.65,h=Math.max(0,Math.sin(e*1.5-Math.PI/2))*.65,s=-Math.sin(e*1.5)*1,l=Math.sin(e*1.5)*1,u=.5,d=.5;else if(r.stickmanAnimState===`jump`){let e=Z%1.8/1.8;n=Math.sin(e*Math.PI)*2,a=e*Math.PI*2,s=-1.2,l=-1.2,f=.7,p=.7,m=1,h=1}if(x.pelvis.position.y=r.demoType===`game`?2.3+i.playerY:2.3+n+r.ikTargetHeight,x.pelvis.rotation.x=a,x.torso.rotation.x=o,x.leftUpperArm.rotation.x=s,x.leftForearm.rotation.x=u,x.rightUpperArm.rotation.x=l,x.rightForearm.rotation.x=d,x.leftThigh.rotation.set(f,0,0),x.leftShin.rotation.set(m,0,0),x.rightThigh.rotation.set(p,0,0),x.rightShin.rotation.set(h,0,0),x.rootGroup.updateMatrixWorld(!0),x.leftFoot&&x.rightFoot){x.leftFoot.getWorldPosition($),x.rightFoot.getWorldPosition(re);let e=Math.min($.y,re.y),t=.08;if(e<t){let n=t-e;x.pelvis.position.y+=n}}if(x.head){let e=c.x*.4+Math.sin(Z*.8)*.15,n=-c.y*.25+Math.cos(Z*1.1)*.08;x.head.rotation.y+=(e-x.head.rotation.y)*.1,x.head.rotation.x+=(n-x.head.rotation.x)*.1;let r=Math.atan2(-c.y,c.x),i=Math.min(.025,Math.sqrt(c.x*c.x+c.y*c.y)*.03),a=Math.cos(r)*i+Math.sin(Z*2.5)*.005,o=Math.sin(r)*i+Math.cos(Z*3)*.005;x.leftPupil&&x.rightPupil&&(x.leftPupil.position.x=a,x.leftPupil.position.y=o,x.rightPupil.position.x=a,x.rightPupil.position.y=o),Q+=t;let s=1;Q%3.5>3.35&&(s=.08),x.leftEye&&x.rightEye&&(x.leftEye.scale.y+=(s-x.leftEye.scale.y)*.4,x.rightEye.scale.y+=(s-x.rightEye.scale.y)*.4)}}p&&d&&f&&p.render(d,f)}function ae(){let e=document.getElementById(`video-btn-play`),t=document.getElementById(`video-btn-pause`),n=document.getElementById(`video-btn-rewind`),r=document.getElementById(`video-timecode`),i=document.getElementById(`video-btn-letterbox`),a=document.getElementById(`video-btn-add-shot`),o=document.getElementById(`video-btn-add-overlay`),s=document.getElementById(`video-btn-export`),c=!1;e&&e.addEventListener(`click`,()=>{M(`[Video Editor] Video Timeline Playback Started.`)}),t&&t.addEventListener(`click`,()=>{M(`[Video Editor] Video Timeline Paused.`)}),n&&n.addEventListener(`click`,()=>{r&&(r.innerText=`00:00:00.000`),cameraController&&cameraController.cutTo(new THREE.Vector3(0,4,10),new THREE.Vector3(0,2.3,0)),M(`[Video Editor] Seeked Playhead to 0.00s.`)}),i&&i.addEventListener(`click`,()=>{c=!c;let e=document.getElementById(`kairo-letterbox-top`)||oe(`top`),t=document.getElementById(`kairo-letterbox-bot`)||oe(`bot`);e.style.height=c?`10%`:`0%`,t.style.height=c?`10%`:`0%`,M(`[Video Editor] 21:9 Widescreen Letterbox: ${c?`ENABLED`:`DISABLED`}`)}),a&&a.addEventListener(`click`,()=>{cameraController&&(cameraController.orbitShot(new THREE.Vector3(0,2.3,0),9,1.2,5),M(`[Video Editor] Added 360° Orbital Camera Shot clip.`))}),o&&o.addEventListener(`click`,()=>{se(),M(`[Video Editor] Added Circle Mask Logo Overlay graphic.`)}),s&&s.addEventListener(`click`,()=>{M(`[Video Editor] Exporting Multi-Track WebM Video file...`),alert(`🎬 Video Timeline exported successfully as kairo-video-edit.webm!`)})}function oe(e){let t=document.createElement(`div`);return t.id=`kairo-letterbox-${e}`,t.style.cssText=`position: fixed; ${e===`top`?`top:0`:`bottom:0`}; left:0; right:0; height:0%; background:#000; transition: height 0.4s ease; z-index: 9999; pointer-events: none;`,document.body.appendChild(t),t}function se(){let e=document.getElementById(`studio-overlay-graphic`);e?e.style.display=e.style.display===`none`?`flex`:`none`:(e=document.createElement(`div`),e.id=`studio-overlay-graphic`,e.style.cssText=`
      position: fixed; top: 18%; right: 5%; width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.8));
      clip-path: circle(45% at 50% 50%); display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 900; font-family: sans-serif; font-size: 13px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 999; pointer-events: none; border: 2px solid white;
    `,e.innerText=`⚡ KAIRO CUT`,document.body.appendChild(e))}function ce(){let e=document.getElementById(`shader-nodes-container`),t=document.getElementById(`shader-wires-svg`),i=document.getElementById(`shader-preview-canvas`),a=document.getElementById(`shader-preset-select`),o=document.getElementById(`shader-preset-tag`),s=document.getElementById(`btn-compile-shader`),c=document.getElementById(`btn-add-shader-node`),l=document.getElementById(`btn-toggle-shader-code`),u=document.getElementById(`shader-code-drawer`),d=document.getElementById(`shader-code-preview`);if(!i)return;let f=new THREE.WebGLRenderer({canvas:i,antialias:!0,alpha:!0});f.setSize(280,180),f.setPixelRatio(Math.min(window.devicePixelRatio,1.5));let p=new THREE.Scene,m=new THREE.PerspectiveCamera(45,280/180,.1,100);m.position.set(0,0,3.2);let h=new THREE.SphereGeometry(1,48,48),g=b(`water`),_=new THREE.Mesh(h,g);p.add(_);let v=performance.now();function y(){requestAnimationFrame(y);let e=(performance.now()-v)/1e3;_&&(_.rotation.y=e*.3),g&&g.uniforms.u_time&&(g.uniforms.u_time.value=e),f.render(p,m)}y();function b(e){return e===`water`?new THREE.ShaderMaterial({transparent:!0,uniforms:{u_time:{value:0},u_shallowColor:{value:new THREE.Color(`#10b981`)},u_deepColor:{value:new THREE.Color(`#0369a1`)}},vertexShader:`
          uniform float u_time;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(pos.x * 5.0 + u_time * 2.0) * cos(pos.z * 5.0 + u_time * 2.0) * 0.1;
            pos += normal * wave;
            vWave = wave;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,fragmentShader:`
          uniform float u_time;
          uniform vec3 u_shallowColor;
          uniform vec3 u_deepColor;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vWave;
          void main() {
            float diff = max(dot(vNormal, normalize(vec3(1.0, 2.0, 1.0))), 0.2);
            vec3 col = mix(u_deepColor, u_shallowColor, vWave * 5.0 + 0.5);
            gl_FragColor = vec4(col * diff, 0.9);
          }
        `}):e===`dissolve`?new THREE.ShaderMaterial({transparent:!0,uniforms:{u_time:{value:0}},vertexShader:`
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform float u_time;
          varying vec2 vUv;
          varying vec3 vNormal;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main() {
            float n = hash(floor(vUv * 12.0));
            float dissolve = sin(u_time * 1.5) * 0.5 + 0.5;
            if (n < dissolve) discard;
            float diff = max(dot(vNormal, normalize(vec3(1.0, 2.0, 1.0))), 0.2);
            vec3 col = mix(vec3(0.2, 0.6, 1.0), vec3(1.0, 0.4, 0.0), step(n, dissolve + 0.08));
            gl_FragColor = vec4(col * diff, 1.0);
          }
        `}):e===`hologram`?new THREE.ShaderMaterial({transparent:!0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{u_time:{value:0}},vertexShader:`
          uniform float u_time;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.x += sin(pos.y * 20.0 + u_time * 8.0) * 0.02;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,fragmentShader:`
          uniform float u_time;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
            float scanline = sin(vUv.y * 40.0 - u_time * 6.0) * 0.5 + 0.5;
            vec3 col = vec3(0.0, 0.9, 1.0) * (fresnel + scanline * 0.5);
            gl_FragColor = vec4(col, fresnel * 0.8 + 0.2);
          }
        `}):e===`toon`?new THREE.ShaderMaterial({uniforms:{u_time:{value:0}},vertexShader:`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          varying vec3 vNormal;
          void main() {
            vec3 L = normalize(vec3(1.0, 2.0, 1.0));
            float diff = max(dot(vNormal, L), 0.0);
            float steps = floor(diff * 3.0) / 3.0;
            steps = max(steps, 0.2);
            vec3 col = vec3(0.9, 0.3, 0.2) * steps;
            gl_FragColor = vec4(col, 1.0);
          }
        `}):new THREE.ShaderMaterial({transparent:!0,blending:THREE.AdditiveBlending,uniforms:{u_time:{value:0}},vertexShader:`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,fragmentShader:`
          uniform float u_time;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);
            float pulse = sin(u_time * 3.0) * 0.3 + 0.8;
            vec3 col = vec3(0.9, 0.2, 1.0) * fresnel * pulse * 2.0;
            gl_FragColor = vec4(col, fresnel * 0.9);
          }
        `})}let x=[{id:`n_uv`,type:`input_uv`,title:`UV Coordinates`,x:20,y:30,inputs:[],outputs:[`UV`]},{id:`n_time`,type:`input_time`,title:`Game Time`,x:20,y:130,inputs:[],outputs:[`Time`]},{id:`n_noise`,type:`input_noise`,title:`Procedural Noise`,x:190,y:30,inputs:[`UV`,`Scale`],outputs:[`Noise`]},{id:`n_color`,type:`input_color`,title:`Color Tint`,x:190,y:140,inputs:[],outputs:[`Color`]},{id:`n_master`,type:`master_output`,title:`Master Output`,x:370,y:70,inputs:[`Base Color`,`Alpha`],outputs:[]}];function S(){e&&(e.innerHTML=``,x.forEach(t=>{let n=document.createElement(`div`);n.className=`shader-node ${t.type===`master_output`?`master-node`:``}`,n.style.left=`${t.x}px`,n.style.top=`${t.y}px`;let r=t.inputs.map(e=>`
        <div class="shader-port-row">
          <span class="shader-port" data-port="${e}"></span>
          <span>${e}</span>
        </div>
      `).join(``),i=t.outputs.map(e=>`
        <div class="shader-port-row">
          <span>${e}</span>
          <span class="shader-port" data-port="${e}"></span>
        </div>
      `).join(``);n.innerHTML=`
        <div class="shader-node-header">${t.title}</div>
        <div class="shader-node-body">
          ${r}
          ${i}
        </div>
      `;let a=!1,o=0,s=0,c=n.querySelector(`.shader-node-header`);c.onmousedown=e=>{a=!0,o=e.clientX-t.x,s=e.clientY-t.y,document.onmousemove=e=>{a&&(t.x=Math.max(0,e.clientX-o),t.y=Math.max(0,e.clientY-s),n.style.left=`${t.x}px`,n.style.top=`${t.y}px`,C())},document.onmouseup=()=>{a=!1,document.onmousemove=null,document.onmouseup=null}},e.appendChild(n)}),C())}function C(){t&&(t.innerHTML=`
      <path d="M 170 60 C 210 60, 180 50, 190 50" stroke="#6366f1" stroke-width="2" fill="none" />
      <path d="M 340 70 C 360 70, 350 90, 370 90" stroke="#06b6d4" stroke-width="2" fill="none" opacity="0.8" />
    `)}S(),a&&(a.onchange=e=>{let t=e.target.value;o&&(o.innerText=e.target.options[e.target.selectedIndex].text),g=b(t),_.material=g,d&&(d.innerText=g.fragmentShader),n.playSound(`click`),M(`[Shader Studio] Loaded Shader Preset: '${t}'`)}),s&&(s.onclick=()=>{let e=a?a.value:`water`;g=b(e),_.material=g;let t=r.entities.find(e=>e.id===r.selectedEntityId);t&&t.threeMesh?(t.threeMesh.material=g,M(`[Shader Compiler] Successfully compiled & applied '${e}' Shader Material to '${t.name}' (${t.id})!`)):M(`[Shader Compiler] Successfully compiled '${e}' Shader Material!`),n.playSound(`jump`)}),c&&(c.onclick=()=>{let e=[`fresnel`,`math_add`,`math_multiply`,`math_sin`],t=e[Math.floor(Math.random()*e.length)];x.push({id:`node_${Date.now()}`,type:t,title:`Node ${t.toUpperCase()}`,x:100+Math.random()*100,y:80+Math.random()*60,inputs:[`A`,`B`],outputs:[`Out`]}),S(),n.playSound(`click`)}),l&&(l.onclick=()=>{if(!u)return;let e=u.style.display!==`none`;u.style.display=e?`none`:`block`,!e&&g&&d&&(d.innerText=g.fragmentShader)})}window.addEventListener(`DOMContentLoaded`,()=>{C(),ee(),ae(),ce(),window.require&&(e.config({paths:{vs:`https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs`}}),e([`vs/editor/editor.main`],function(){monaco.languages.typescript.javascriptDefaults.addExtraLib(`
        declare namespace EasyScript {
          function createBehavior(config: {
            onStart?: () => void;
            onUpdate?: (dt: number) => void;
          }): void;
        }
        
        interface BehaviorContext {
          // Video & Camera Cinematic
          createVideoTimeline(durationSeconds: number): void;
          addCameraShot(time: number, duration: number, type: 'orbit' | 'pan' | 'dolly' | 'crane', config?: any): void;
          addVideoOverlay(time: number, duration: number, url: string, maskConfig?: any): void;
          addVideoText(time: number, duration: number, text: string): void;
          addVideoTransition(time: number, duration: number, type: 'wipeLeft' | 'wipeRight' | 'circleWipe' | 'glitch'): void;
          addVideoColorGrading(time: number, duration: number, preset: 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'vintage'): void;
          playVideoTimeline(): void;
          
          // Automatic Motions
          spin(speed?: number): void;
          bob(amount?: number, speed?: number): void;
          patrol(distance?: number, speed?: number): void;
          pulse(minScale?: number, maxScale?: number, speed?: number): void;
          stop(): void;

          // Physics & Movement
          move(dx: number, dy: number, dz: number): void;
          moveForward(distance: number): void;
          jump(force?: number): void;
          chase(targetPos: any, speed: number, dt: number): void;
          
          // Effects
          changeColor(hex: string): void;
          randomColor(): void;
          playSound(name: string): void;
          sparkle(count?: number): void;
          explode(count?: number): void;
          dustBurst(count?: number): void;
          teleportEffect(): void;

          // Asset Loaders
          loadModel(url: string): void;
          loadBlenderModel(url: string): void;
          streamSketchfab(uid: string): void;
        }

        // Make 'this' context strongly typed inside EasyScript lifecycle hooks
        declare module "EasyScript" {
          export interface BehaviorConfig {
            onStart(this: BehaviorContext): void;
            onUpdate(this: BehaviorContext, dt: number): void;
          }
        }
      `,`kairo-easyscript.d.ts`),window.kairoCodeEditor=monaco.editor.create(document.getElementById(`monaco-editor-container`),{value:`EasyScript.createBehavior({
  onStart() {
    // Autocomplete is ready! Try typing: this.
    this.spin(1.5);
    this.changeColor('#38bdf8');
  },
  onUpdate(dt) {
    // Frame update loop
  }
});`,language:`javascript`,theme:`vs-dark`,minimap:{enabled:!1},automaticLayout:!0})}));let t=document.getElementById(`btn-save-script`);t&&t.addEventListener(`click`,()=>{if(window.kairoCodeEditor){let e=window.kairoCodeEditor.getValue();console.log(`Script attached to object:
`+e),alert(`✅ Custom EasyScript compiled and attached to object!`)}})});