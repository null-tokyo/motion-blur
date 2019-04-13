import * as THREE from 'three'

import vert from '../../glsl/modules/cube.vert'
import frag from '../../glsl/modules/cube.frag'
import param from '../const/param'

class Cubes {
    constructor(webgl) {
        this.webgl = webgl
        this.init()
    }
    init() {
        this.width = this.webgl.width
        this.height = this.webgl.height
        this.scene = new THREE.Scene()
        this.meshs = []
        this.gravity = new THREE.Vector3(0, -0.005, 0)

        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.01,
            10000
        )

        this.scene.add(this.camera)
        this.camera.position.set(0, 4, 8)

        this.camera.lookAt(this.scene.position)
        this.cameraVector = new THREE.Vector3()

        this.light = new THREE.DirectionalLight(0xffffff, 1)

        this.renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        }

        this.fbo = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            this.renderTargetParameters
        )
        this.fbo.texture.format = THREE.RGBAFormat

        this.group = new THREE.Group()

        for (let i = 0; i < 30; i++) {
            this.meshs.push(this.createMesh())
            this.meshs[i].velocity = this.createVelocity()
        }
    }

    createMesh() {
        let index = Math.floor(Math.random() * 5)
        this.geometrys = [
            new THREE.TorusBufferGeometry(0.2, 0.09, 20, 100),
            new THREE.TetrahedronBufferGeometry(0.4, 0),
            new THREE.IcosahedronBufferGeometry(0.4, 0),
            new THREE.SphereBufferGeometry(0.3, 32, 32),
            new THREE.PlaneGeometry(0.4, 0.4, 1),
        ]
        this.geometry = this.geometrys[index]

        this.uniforms = {
            uTime: { type: 'f', value: 0 },
            uDelta: { type: 'f', value: 0 },
            uColorArray: {
                type: 'v3v',
                value: [
                    new THREE.Color(0x333),
                    new THREE.Color(0x9dd1d1),
                    new THREE.Color(0xefef00),
                    new THREE.Color(0x426bf0),
                ],
            },
            uFogColor: { type: 'v3', value: new THREE.Color(0xe3e3e3) },
            uCameraDirection: {
                type: 'v3v',
                value: this.camera.getWorldDirection(this.cameraVector),
            },
            uCameraPosition: {
                type: 'v3v',
                value: this.camera.position,
            },
            uFogStart: { type: 'f', value: 0.5 },
            uFogEnd: { type: 'f', value: 12.0 },
        }

        this.material = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: this.uniforms,
            flatShading: true,
            side: THREE.DoubleSide,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(0, -5, 0)
        this.mesh.rotation.x += Math.random()
        this.mesh.rotation.y += Math.random()
        this.mesh.rotation.z += Math.random()

        this.scene.add(this.mesh)

        return this.mesh
    }
    createVelocity() {
        let velocity = new THREE.Vector3(
            0.08 * Math.random() - 0.04,
            0.1 + Math.random() * 0.2,
            0.08 * Math.random() - 0.04
        )
        return velocity
    }
    update() {
        for (let i = 0; i < this.meshs.length; i++) {
            let m = this.meshs[i]
            m.velocity.add(this.gravity)
            m.position.add(m.velocity)
            m.rotation.x += 0.1
            m.rotation.y += 0.02
            m.rotation.z += 0.01

            if (m.position.y < -5) {
                m.position.set(0, -5, 0)
                m.velocity = this.createVelocity()
            }
        }
    }
    updateUniforms(time, delta) {
        this.uniforms.uTime.value = time
        this.uniforms.uDelta.value = delta
    }
    render(time, delta) {
        this.webgl.renderer.setRenderTarget(this.fbo)

        this.updateUniforms(time, delta)

        this.webgl.renderer.render(this.scene, this.camera, this.fbo)
    }
}

export default Cubes
