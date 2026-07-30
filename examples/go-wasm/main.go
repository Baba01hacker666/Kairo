package main

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"sort"
	"strconv"
	"strings"
	"syscall/js"
)

// ==========================================
// KAIRO GO-WASM 3D ENGINE
// ==========================================

type Vector3 struct {
	x, y, z float64
}

func (v Vector3) Add(other Vector3) Vector3 {
	return Vector3{v.x + other.x, v.y + other.y, v.z + other.z}
}

func (v Vector3) Rotate(ax, ay, az float64) Vector3 {
	y1 := v.y*math.Cos(ax) - v.z*math.Sin(ax)
	z1 := v.y*math.Sin(ax) + v.z*math.Cos(ax)
	x2 := v.x*math.Cos(ay) + z1*math.Sin(ay)
	z2 := -v.x*math.Sin(ay) + z1*math.Cos(ay)
	x3 := x2*math.Cos(az) - y1*math.Sin(az)
	y3 := x2*math.Sin(az) + y1*math.Cos(az)
	return Vector3{x3, y3, z2}
}

type Face struct {
	indices []int
	r, g, b float64
	alpha   float64
}

type Mesh struct {
	vertices []Vector3
	faces    []Face
}

type Transform struct {
	position Vector3
	rotation Vector3
	scale    Vector3
}

type Entity struct {
	mesh      *Mesh
	transform Transform
	collider  float64 // Radius for sphere collision, 0 = no collider
	isPlayer  bool
}

type Camera struct {
	position Vector3
	fov      float64
}

type Scene struct {
	entities []*Entity
	camera   Camera
}

// --- Procedural Geometry Generators ---

func CreateQuadMesh(s float64, r, g, b, a float64) *Mesh {
	hs := s / 2.0
	return &Mesh{
		vertices: []Vector3{{-hs, 0, -hs}, {hs, 0, -hs}, {hs, 0, hs}, {-hs, 0, hs}},
		faces:    []Face{{indices: []int{0, 1, 2, 3}, r: r, g: g, b: b, alpha: a}},
	}
}

func CreateCylinderMesh(radius, h float64, sides int, r, g, b, a float64) *Mesh {
	var verts []Vector3
	var faces []Face

	for i := 0; i < sides; i++ {
		angle := 2.0 * math.Pi * float64(i) / float64(sides)
		verts = append(verts, Vector3{math.Cos(angle) * radius, -h / 2.0, math.Sin(angle) * radius})
	}
	for i := 0; i < sides; i++ {
		angle := 2.0 * math.Pi * float64(i) / float64(sides)
		verts = append(verts, Vector3{math.Cos(angle) * (radius * 0.7), h / 2.0, math.Sin(angle) * (radius * 0.7)})
	}

	for i := 0; i < sides; i++ {
		next_i := (i + 1) % sides
		faces = append(faces, Face{
			indices: []int{i, next_i, next_i + sides, i + sides},
			r: r, g: g, b: b, alpha: a,
		})
	}
	
	var topIndices []int
	for i := sides - 1; i >= 0; i-- { // Reverse winding for top
		topIndices = append(topIndices, i+sides)
	}
	faces = append(faces, Face{indices: topIndices, r: r, g: g, b: b, alpha: a})

	return &Mesh{vertices: verts, faces: faces}
}

func CreateIcosahedronMesh(radius float64, r, g, b, a float64) *Mesh {
	t := (1.0 + math.Sqrt(5.0)) / 2.0
	verts := []Vector3{
		{-1, t, 0}, {1, t, 0}, {-1, -t, 0}, {1, -t, 0},
		{0, -1, t}, {0, 1, t}, {0, -1, -t}, {0, 1, -t},
		{t, 0, -1}, {t, 0, 1}, {-t, 0, -1}, {-t, 0, 1},
	}
	
	for i, v := range verts {
		l := math.Sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
		verts[i] = Vector3{(v.x / l) * radius, (v.y / l) * radius, (v.z / l) * radius}
	}

	indices := [][]int{
		{0, 11, 5}, {0, 5, 1}, {0, 1, 7}, {0, 7, 10}, {0, 10, 11},
		{1, 5, 9}, {5, 11, 4}, {11, 10, 2}, {10, 7, 6}, {7, 1, 8},
		{3, 9, 4}, {3, 4, 2}, {3, 2, 6}, {3, 6, 8}, {3, 8, 9},
		{4, 9, 5}, {2, 4, 11}, {6, 2, 10}, {8, 6, 7}, {9, 8, 1},
	}

	var faces []Face
	for _, idx := range indices {
		faces = append(faces, Face{indices: idx, r: r, g: g, b: b, alpha: a})
	}
	return &Mesh{vertices: verts, faces: faces}
}

// --- Advanced OBJ & MTL Parser ---

type Material struct {
	r, g, b float64
	alpha   float64
}

func parseMTL(data string) map[string]Material {
	materials := make(map[string]Material)
	var currentMtl string
	lines := strings.Split(data, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "newmtl ") {
			currentMtl = strings.TrimSpace(line[7:])
			materials[currentMtl] = Material{r: 255, g: 255, b: 255, alpha: 1.0}
		} else if strings.HasPrefix(line, "Kd ") && currentMtl != "" {
			parts := strings.Fields(line)
			if len(parts) >= 4 {
				r, _ := strconv.ParseFloat(parts[1], 64)
				g, _ := strconv.ParseFloat(parts[2], 64)
				b, _ := strconv.ParseFloat(parts[3], 64)
				
				mat := materials[currentMtl]
				mat.r = r * 255
				mat.g = g * 255
				mat.b = b * 255
				materials[currentMtl] = mat
			}
		} else if (strings.HasPrefix(line, "d ") || strings.HasPrefix(line, "Tr ")) && currentMtl != "" {
			parts := strings.Fields(line)
			if len(parts) >= 2 {
				a, _ := strconv.ParseFloat(parts[1], 64)
				if strings.HasPrefix(line, "Tr ") { a = 1.0 - a } // Tr is transparency, d is dissolve (opacity)
				mat := materials[currentMtl]
				mat.alpha = a
				materials[currentMtl] = mat
			}
		}
	}
	return materials
}

func parseOBJ(data string, materials map[string]Material, defaultR, defaultG, defaultB, defaultA float64) *Mesh {
	lines := strings.Split(data, "\n")
	var verts []Vector3
	var faces []Face

	currentMat := Material{r: defaultR, g: defaultG, b: defaultB, alpha: defaultA}

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "v ") {
			parts := strings.Fields(line)
			if len(parts) >= 4 {
				px, _ := strconv.ParseFloat(parts[1], 64)
				py, _ := strconv.ParseFloat(parts[2], 64)
				pz, _ := strconv.ParseFloat(parts[3], 64)
				verts = append(verts, Vector3{px, py, pz})
			}
		} else if strings.HasPrefix(line, "usemtl ") {
			matName := strings.TrimSpace(line[7:])
			if mat, ok := materials[matName]; ok {
				currentMat = mat
			}
		} else if strings.HasPrefix(line, "f ") {
			parts := strings.Fields(line)
			var indices []int
			for i := 1; i < len(parts); i++ {
				idxStr := strings.Split(parts[i], "/")[0]
				idx, _ := strconv.Atoi(idxStr)
				indices = append(indices, idx-1) // 1-based to 0-based
			}
			if len(indices) >= 3 {
				faces = append(faces, Face{indices: indices, r: currentMat.r, g: currentMat.g, b: currentMat.b, alpha: currentMat.alpha})
			}
		}
	}
	return &Mesh{vertices: verts, faces: faces}
}

func loadOBJFromURL(objURL, mtlURL string, defR, defG, defB, defA float64, pos, scale Vector3, collider float64) {
	if mtlURL == "" {
		// Just load OBJ
		js.Global().Call("fetch", objURL).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return args[0].Call("text")
		})).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			data := args[0].String()
			mesh := parseOBJ(data, nil, defR, defG, defB, defA)
			scene.entities = append(scene.entities, &Entity{
				mesh:      mesh,
				transform: Transform{position: pos, rotation: Vector3{0, 0, 0}, scale: scale},
				collider:  collider,
			})
			return nil
		}))
	} else {
		// Load MTL then OBJ
		js.Global().Call("fetch", mtlURL).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			return args[0].Call("text")
		})).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			mtlData := args[0].String()
			materials := parseMTL(mtlData)
			
			js.Global().Call("fetch", objURL).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				return args[0].Call("text")
			})).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				objData := args[0].String()
				mesh := parseOBJ(objData, materials, defR, defG, defB, defA)
				scene.entities = append(scene.entities, &Entity{
					mesh:      mesh,
					transform: Transform{position: pos, rotation: Vector3{0, 0, 0}, scale: scale},
					collider:  collider,
				})
				return nil
			}))
			return nil
		}))
	}
}

// --- GLTF 2.0 Parser ---
type GLTF struct {
	Buffers []struct {
		URI        string `json:"uri"`
		ByteLength int    `json:"byteLength"`
	} `json:"buffers"`
	BufferViews []struct {
		Buffer     int `json:"buffer"`
		ByteOffset int `json:"byteOffset"`
		ByteLength int `json:"byteLength"`
		ByteStride int `json:"byteStride"`
	} `json:"bufferViews"`
	Accessors []struct {
		BufferView    int    `json:"bufferView"`
		ByteOffset    int    `json:"byteOffset"`
		ComponentType int    `json:"componentType"`
		Count         int    `json:"count"`
		Type          string `json:"type"`
	} `json:"accessors"`
	Meshes []struct {
		Primitives []struct {
			Attributes map[string]int `json:"attributes"`
			Indices    *int           `json:"indices"`
			Material   *int           `json:"material"`
		} `json:"primitives"`
	} `json:"meshes"`
	Materials []struct {
		PbrMetallicRoughness struct {
			BaseColorFactor []float64 `json:"baseColorFactor"`
		} `json:"pbrMetallicRoughness"`
	} `json:"materials"`
}

func parseGLTF(gltf GLTF, binData []byte, defR, defG, defB, defA float64) *Mesh {
	var verts []Vector3
	var faces []Face

	if len(gltf.Meshes) == 0 || len(gltf.Meshes[0].Primitives) == 0 {
		return &Mesh{}
	}
	prim := gltf.Meshes[0].Primitives[0]

	r, g, b, a := defR, defG, defB, defA
	if prim.Material != nil && len(gltf.Materials) > *prim.Material {
		mat := gltf.Materials[*prim.Material]
		if len(mat.PbrMetallicRoughness.BaseColorFactor) == 4 {
			r = mat.PbrMetallicRoughness.BaseColorFactor[0] * 255
			g = mat.PbrMetallicRoughness.BaseColorFactor[1] * 255
			b = mat.PbrMetallicRoughness.BaseColorFactor[2] * 255
			a = mat.PbrMetallicRoughness.BaseColorFactor[3]
		}
	}

	posAccIdx, ok := prim.Attributes["POSITION"]
	if ok && len(gltf.Accessors) > posAccIdx {
		acc := gltf.Accessors[posAccIdx]
		bv := gltf.BufferViews[acc.BufferView]
		start := bv.ByteOffset + acc.ByteOffset
		stride := bv.ByteStride
		if stride == 0 {
			stride = 12
		}

		for i := 0; i < acc.Count; i++ {
			offset := start + (i * stride)
			vx := math.Float32frombits(binary.LittleEndian.Uint32(binData[offset : offset+4]))
			vy := math.Float32frombits(binary.LittleEndian.Uint32(binData[offset+4 : offset+8]))
			vz := math.Float32frombits(binary.LittleEndian.Uint32(binData[offset+8 : offset+12]))
			verts = append(verts, Vector3{float64(vx), float64(vy), float64(vz)})
		}
	}

	if prim.Indices != nil && len(gltf.Accessors) > *prim.Indices {
		acc := gltf.Accessors[*prim.Indices]
		bv := gltf.BufferViews[acc.BufferView]
		start := bv.ByteOffset + acc.ByteOffset

		var indices []int
		for i := 0; i < acc.Count; i++ {
			var idx int
			if acc.ComponentType == 5123 { // UNSIGNED_SHORT
				offset := start + (i * 2)
				idx = int(binary.LittleEndian.Uint16(binData[offset : offset+2]))
			} else if acc.ComponentType == 5125 { // UNSIGNED_INT
				offset := start + (i * 4)
				idx = int(binary.LittleEndian.Uint32(binData[offset : offset+4]))
			}
			indices = append(indices, idx)
		}

		for i := 0; i < len(indices); i += 3 {
			if i+2 < len(indices) {
				faces = append(faces, Face{
					indices: []int{indices[i], indices[i+1], indices[i+2]},
					r: r, g: g, b: b, alpha: a,
				})
			}
		}
	} else {
		for i := 0; i < len(verts); i += 3 {
			if i+2 < len(verts) {
				faces = append(faces, Face{
					indices: []int{i, i+1, i+2},
					r: r, g: g, b: b, alpha: a,
				})
			}
		}
	}
	return &Mesh{vertices: verts, faces: faces}
}

func loadGLTFFromURL(gltfURL string, defR, defG, defB, defA float64, pos, scale Vector3, collider float64) {
	js.Global().Call("fetch", gltfURL).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return args[0].Call("text")
	})).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		jsonData := args[0].String()
		var gltf GLTF
		json.Unmarshal([]byte(jsonData), &gltf)

		if len(gltf.Buffers) > 0 {
			uri := gltf.Buffers[0].URI
			if !strings.HasPrefix(uri, "data:") {
				parts := strings.Split(gltfURL, "/")
				parts[len(parts)-1] = uri
				uri = strings.Join(parts, "/")
			}

			js.Global().Call("fetch", uri).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				return args[0].Call("arrayBuffer")
			})).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				bufferObj := js.Global().Get("Uint8Array").New(args[0])
				bytes := make([]byte, bufferObj.Get("length").Int())
				js.CopyBytesToGo(bytes, bufferObj)

				mesh := parseGLTF(gltf, bytes, defR, defG, defB, defA)
				scene.entities = append(scene.entities, &Entity{
					mesh:      mesh,
					transform: Transform{position: pos, rotation: Vector3{0, 0, 0}, scale: scale},
					collider:  collider,
				})
				return nil
			}))
		}
		return nil
	}))
}

// --- Global State ---
var (
	ctx    js.Value
	width  float64
	height float64
	scene  *Scene
	
	camAngleX float64 = 0.0
	camAngleY float64 = 0.0
	isDragging bool = false
	lastMouseX float64 = 0.0
	lastMouseY float64 = 0.0
	
	touchLeft  bool = false
	touchRight bool = false
	
	keys map[string]bool = make(map[string]bool)
	
	obstacles  []*ObstacleState
	lastTime   float64 = 0
	gameOver   bool = false
	score      int = 0
)

type ObstacleState struct {
	entity *Entity
	speed  float64
}

type ProjectedFace struct {
	points []Vector3
	color  string
	z      float64
}

func project(p Vector3, cam Camera) Vector3 {
	rel := Vector3{p.x - cam.position.x, p.y - cam.position.y, p.z - cam.position.z}
	zDepth := -rel.z
	if zDepth < 0.1 {
		zDepth = 0.1
	}
	factor := cam.fov / zDepth
	return Vector3{
		x: rel.x*factor + width/2, 
		y: -rel.y*factor + height/2, 
		z: rel.z,
	}
}

func checkCollision(e1, e2 *Entity) bool {
	if e1.collider == 0 || e2.collider == 0 { return false }
	dx := e1.transform.position.x - e2.transform.position.x
	dy := e1.transform.position.y - e2.transform.position.y
	dz := e1.transform.position.z - e2.transform.position.z
	dist := math.Sqrt(dx*dx + dy*dy + dz*dz)
	return dist < (e1.collider + e2.collider)
}

func renderFrame(this js.Value, args []js.Value) interface{} {
	timeMs := js.Global().Get("performance").Call("now").Float()
	if lastTime == 0 {
		lastTime = timeMs
	}
	dt := (timeMs - lastTime) * 0.001
	lastTime = timeMs
	
	if dt > 0.1 {
		dt = 0.1
	}
	
	time := timeMs * 0.001

	// --- Player Movement & Game Logic ---
	var player *Entity
	for _, e := range scene.entities {
		if e.isPlayer {
			player = e
			break
		}
	}
	
	if player != nil && !gameOver {
		speed := 15.0 * dt
		velX := 0.0
		
		// AD Movement and Mobile Touch Support
		if keys["a"] || keys["ArrowLeft"] || touchLeft {
			velX -= speed
		}
		if keys["d"] || keys["ArrowRight"] || touchRight {
			velX += speed
		}
		
		player.transform.position.x += velX
		
		// Bound player to the track
		if player.transform.position.x < -8.0 { player.transform.position.x = -8.0 }
		if player.transform.position.x > 8.0 { player.transform.position.x = 8.0 }

		// Move obstacles towards player
		for _, obs := range obstacles {
			obs.entity.transform.position.z += obs.speed * dt
			
			// Collision detection
			if checkCollision(player, obs.entity) {
				gameOver = true
				fmt.Println("GAME OVER! Score:", score)
			}
			
			// Respawn obstacle if it goes behind camera
			if obs.entity.transform.position.z > 10.0 {
				obs.entity.transform.position.z = -50.0 - (rand.Float64() * 20.0)
				obs.entity.transform.position.x = (rand.Float64() - 0.5) * 16.0
				obs.speed = 20.0 + (rand.Float64() * 10.0) + float64(score)*0.5 // Gets faster!
				score++
			}
		}
		
		// Camera locked behind player
		scene.camera.position.x = player.transform.position.x * 0.5 // slight tracking
		scene.camera.position.y = 4.0
		scene.camera.position.z = player.transform.position.z + 12.0
		
		// Make player box rotate slightly as it runs
		player.transform.rotation.x += 2.0 * dt
	} else if player != nil {
		// Game Over state - camera pulls back
		scene.camera.position.y += 2.0 * dt
		scene.camera.position.z += 2.0 * dt
	}

	lightDir := Vector3{-0.5, 1.0, -0.5} 
	lightLen := math.Sqrt(lightDir.x*lightDir.x + lightDir.y*lightDir.y + lightDir.z*lightDir.z)
	lightDir.x /= lightLen; lightDir.y /= lightLen; lightDir.z /= lightLen
	
	// Brighter lighting
	ambientLight := 0.75 
	diffusePower := 0.8 

	ctx.Set("fillStyle", "#09090b")
	ctx.Call("fillRect", 0, 0, width, height)
	
	if gameOver {
		ctx.Set("fillStyle", "red")
		ctx.Set("font", "48px Inter")
		ctx.Call("fillText", "GAME OVER", width/2 - 130, height/2)
		ctx.Set("fillStyle", "white")
		ctx.Set("font", "24px Inter")
		ctx.Call("fillText", fmt.Sprintf("Score: %d", score), width/2 - 50, height/2 + 40)
	} else {
		ctx.Set("fillStyle", "white")
		ctx.Set("font", "24px Inter")
		ctx.Call("fillText", fmt.Sprintf("Score: %d", score), 20, 40)
	}

	var pFaces []ProjectedFace

	for _, ent := range scene.entities {
		transformed := make([]Vector3, len(ent.mesh.vertices))
		for j, v := range ent.mesh.vertices {
			v.x *= ent.transform.scale.x
			v.y *= ent.transform.scale.y
			v.z *= ent.transform.scale.z
			v = v.Rotate(ent.transform.rotation.x, ent.transform.rotation.y, ent.transform.rotation.z)
			v = v.Add(ent.transform.position)
			
			// In runner game, we don't let mouse rotate the world, keep it straight
			// v = v.Rotate(camAngleY, camAngleX, 0)
			
			transformed[j] = v
		}

		isDoubleSided := len(ent.mesh.faces) == 1

		for _, f := range ent.mesh.faces {
			if len(f.indices) < 3 { continue }
			
			p0 := transformed[f.indices[0]]
			p1 := transformed[f.indices[1]]
			p2 := transformed[f.indices[2]]
			
			v1 := Vector3{p1.x - p0.x, p1.y - p0.y, p1.z - p0.z}
			v2 := Vector3{p2.x - p0.x, p2.y - p0.y, p2.z - p0.z}
			
			nx := v1.y*v2.z - v1.z*v2.y
			ny := v1.z*v2.x - v1.x*v2.z
			nz := v1.x*v2.y - v1.y*v2.x
			
			nl := math.Sqrt(nx*nx + ny*ny + nz*nz)
			if nl > 0 { nx /= nl; ny /= nl; nz /= nl }

			if !isDoubleSided {
				viewDirX := scene.camera.position.x - p0.x
				viewDirY := scene.camera.position.y - p0.y
				viewDirZ := scene.camera.position.z - p0.z
				if (nx*viewDirX + ny*viewDirY + nz*viewDirZ) < 0 {
					continue 
				}
			}

			diffuse := nx*lightDir.x + ny*lightDir.y + nz*lightDir.z
			if isDoubleSided {
				diffuse = math.Abs(diffuse)
			}
			if diffuse < 0 { diffuse = 0 }
			
			intensity := ambientLight + (diffuse * diffusePower)
			if intensity > 1.0 { intensity = 1.0 }

			finalR := int(f.r * intensity)
			finalG := int(f.g * intensity)
			finalB := int(f.b * intensity)
			colorStr := fmt.Sprintf("rgba(%d, %d, %d, %.2f)", finalR, finalG, finalB, f.alpha)

			var pts []Vector3
			avgZ := 0.0
			for _, idx := range f.indices {
				p := project(transformed[idx], scene.camera)
				pts = append(pts, p)
				avgZ += p.z
			}
			avgZ /= float64(len(pts))

			pFaces = append(pFaces, ProjectedFace{points: pts, color: colorStr, z: avgZ})
		}
	}

	sort.SliceStable(pFaces, func(i, j int) bool {
		return pFaces[i].z < pFaces[j].z
	})

	ctx.Set("lineWidth", 1.2)
	ctx.Set("lineJoin", "round")

	for _, pf := range pFaces {
		ctx.Set("fillStyle", pf.color)
		ctx.Set("strokeStyle", pf.color)

		ctx.Call("beginPath")
		ctx.Call("moveTo", pf.points[0].x, pf.points[0].y)
		for i := 1; i < len(pf.points); i++ {
			ctx.Call("lineTo", pf.points[i].x, pf.points[i].y)
		}
		ctx.Call("closePath")
		
		ctx.Call("fill")
		ctx.Call("stroke")
	}

	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	return nil
}

func main() {
	c := make(chan struct{}, 0)

	document := js.Global().Get("document")
	canvas := document.Call("getElementById", "canvas")
	
	updateCanvasSize := func() {
		width = js.Global().Get("window").Get("innerWidth").Float()
		height = js.Global().Get("window").Get("innerHeight").Float()
		canvas.Set("width", width)
		canvas.Set("height", height)
	}
	
	js.Global().Get("window").Call("addEventListener", "resize", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		updateCanvasSize()
		return nil
	}))
	updateCanvasSize()
	ctx = canvas.Call("getContext", "2d")

	// --- Input Handling ---
	onDown := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		isDragging = true
		e := args[0]
		
		var clientX float64
		if e.Get("touches").Truthy() && e.Get("touches").Get("length").Int() > 0 {
			clientX = e.Get("touches").Index(0).Get("clientX").Float()
		} else {
			clientX = e.Get("clientX").Float()
		}
		
		if clientX < width/2.0 {
			touchLeft = true
			touchRight = false
		} else {
			touchRight = true
			touchLeft = false
		}
		return nil
	})
	
	onMove := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if !isDragging { return nil }
		e := args[0]
		
		var clientX float64
		if e.Get("touches").Truthy() && e.Get("touches").Get("length").Int() > 0 {
			clientX = e.Get("touches").Index(0).Get("clientX").Float()
		} else {
			clientX = e.Get("clientX").Float()
		}
		
		// Update touch side if they drag across the middle
		if clientX < width/2.0 {
			touchLeft = true
			touchRight = false
		} else {
			touchRight = true
			touchLeft = false
		}
		return nil
	})
	
	onUp := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		isDragging = false
		touchLeft = false
		touchRight = false
		return nil
	})

	canvas.Call("addEventListener", "mousedown", onDown)
	canvas.Call("addEventListener", "mousemove", onMove)
	canvas.Call("addEventListener", "mouseup", onUp)
	canvas.Call("addEventListener", "mouseleave", onUp)
	
	canvas.Call("addEventListener", "touchstart", onDown)
	canvas.Call("addEventListener", "touchmove", onMove)
	canvas.Call("addEventListener", "touchend", onUp)
	
	// Keyboard Input
	js.Global().Get("window").Call("addEventListener", "keydown", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		key := args[0].Get("key").String()
		keys[key] = true
		return nil
	}))
	js.Global().Get("window").Call("addEventListener", "keyup", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		key := args[0].Get("key").String()
		keys[key] = false
		return nil
	}))
	// ----------------------

	scene = &Scene{
		camera: Camera{position: Vector3{0, 6, 20}, fov: 700},
	}

	// The track / ground
	track := CreateQuadMesh(50.0, 74, 93, 35, 1.0)
	scene.entities = append(scene.entities, &Entity{
		mesh:      track,
		transform: Transform{position: Vector3{0, 0, -20}, scale: Vector3{1, 1, 3}},
	})

	// Add the Player Box Entity (Green Box)
	// We use the procedural box mesh so we have immediate access to flag it as the player
	playerMesh := CreateBoxMesh(1.2, 0, 255, 150, 1.0) 
	scene.entities = append(scene.entities, &Entity{
		mesh:      playerMesh,
		transform: Transform{position: Vector3{0, 0.6, 0}, scale: Vector3{1, 1, 1}},
		collider:  0.8,
		isPlayer:  true,
	})

	// Obstacles - Spawning 10 Boxes at different Z distances
	for i := 0; i < 10; i++ {
		startZ := -20.0 - float64(i)*15.0
		startX := (rand.Float64() - 0.5) * 16.0
		
		obsMesh := CreateBoxMesh(1.5, 255, 50, 50, 1.0) // Red enemy box
		
		obsEnt := &Entity{
			mesh:      obsMesh,
			transform: Transform{position: Vector3{startX, 0.75, startZ}, scale: Vector3{1, 1, 1}},
			collider:  1.0,
		}
		scene.entities = append(scene.entities, obsEnt)
		obstacles = append(obstacles, &ObstacleState{
			entity: obsEnt,
			speed:  20.0,
		})
	}
	
	// Wait! The user explicitly said: "use box as the obstcale and player".
	// Since loadGLTFFromURL is async, I can modify it to return a Promise or take a callback.
	// But it's easier to just build a procedural Box mesh in Go!
	
	js.Global().Call("requestAnimationFrame", js.FuncOf(renderFrame))
	<-c
}

// Procedural Box Mesh Generator
func CreateBoxMesh(s float64, r, g, b, a float64) *Mesh {
	hs := s / 2.0
	verts := []Vector3{
		{-hs, -hs, -hs}, {hs, -hs, -hs}, {hs, hs, -hs}, {-hs, hs, -hs}, // Front
		{-hs, -hs, hs}, {hs, -hs, hs}, {hs, hs, hs}, {-hs, hs, hs}, // Back
	}
	faces := []Face{
		{indices: []int{0, 1, 2, 3}, r: r, g: g, b: b, alpha: a}, // Front
		{indices: []int{5, 4, 7, 6}, r: r, g: g, b: b, alpha: a}, // Back
		{indices: []int{4, 0, 3, 7}, r: r, g: g, b: b, alpha: a}, // Left
		{indices: []int{1, 5, 6, 2}, r: r, g: g, b: b, alpha: a}, // Right
		{indices: []int{3, 2, 6, 7}, r: r, g: g, b: b, alpha: a}, // Top
		{indices: []int{4, 5, 1, 0}, r: r, g: g, b: b, alpha: a}, // Bottom
	}
	return &Mesh{vertices: verts, faces: faces}
}
