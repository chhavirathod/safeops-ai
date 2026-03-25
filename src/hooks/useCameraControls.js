import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MOVE_SPEED = 0.3
const LERP_FACTOR = 0.08
const ANGLE_SPEED = 0.02
const LOOK_DISTANCE = 24
const HUB_CAMERA_CONFIG = {
    position: [-12.5, 7.8, 8.5],
    yaw: Math.atan2(14, -11),
    pitch: -0.2,
    minX: -15,
    maxX: 15,
    minZ: -9,
    maxZ: 11,
}
const ROOM_CAMERA_CONFIG = {
    position: [-10.5, 7.4, 7.4],
    yaw: Math.atan2(15, -9),
    pitch: -0.24,
    minX: -13.5,
    maxX: 13.5,
    minZ: -8.5,
    maxZ: 9.5,
}
const MIN_PITCH = -0.65
const MAX_PITCH = -0.08

function getCameraConfig(areaId) {
    return areaId === 'hub' ? HUB_CAMERA_CONFIG : ROOM_CAMERA_CONFIG
}

export default function useCameraControls(resetKey, areaId) {
    const { camera } = useThree()
    const keys = useRef({})
    const config = useRef(getCameraConfig(areaId))
    const targetPos = useRef(new THREE.Vector3(...config.current.position))
    const yaw = useRef(config.current.yaw)
    const pitch = useRef(config.current.pitch)

    useEffect(() => {
        config.current = getCameraConfig(areaId)
        const [initialX, initialY, initialZ] = config.current.position

        targetPos.current.set(initialX, initialY, initialZ)
        yaw.current = config.current.yaw
        pitch.current = config.current.pitch
        camera.position.set(initialX, initialY, initialZ)
        const initialLookTarget = new THREE.Vector3(
            Math.sin(config.current.yaw) * Math.cos(config.current.pitch),
            Math.sin(config.current.pitch),
            Math.cos(config.current.yaw) * Math.cos(config.current.pitch)
        )
            .multiplyScalar(LOOK_DISTANCE)
            .add(new THREE.Vector3(initialX, initialY, initialZ))
        camera.lookAt(initialLookTarget)

        const onKeyDown = (e) => { keys.current[e.key] = true }
        const onKeyUp = (e) => { keys.current[e.key] = false }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [camera, resetKey])

    useFrame(() => {
        const k = keys.current
        const target = targetPos.current

        if (k['ArrowUp']) target.z -= MOVE_SPEED
        if (k['ArrowDown']) target.z += MOVE_SPEED
        if (k['ArrowLeft']) target.x -= MOVE_SPEED
        if (k['ArrowRight']) target.x += MOVE_SPEED

        if (k['a']) yaw.current -= ANGLE_SPEED
        if (k['d']) yaw.current += ANGLE_SPEED
        if (k['w']) pitch.current += ANGLE_SPEED
        if (k['s']) pitch.current -= ANGLE_SPEED

        // Clamp
        target.x = THREE.MathUtils.clamp(target.x, config.current.minX, config.current.maxX)
        target.z = THREE.MathUtils.clamp(target.z, config.current.minZ, config.current.maxZ)
        pitch.current = THREE.MathUtils.clamp(pitch.current, MIN_PITCH, MAX_PITCH)

        // Lerp
        camera.position.lerp(target, LERP_FACTOR)
        const lookDirection = new THREE.Vector3(
            Math.sin(yaw.current) * Math.cos(pitch.current),
            Math.sin(pitch.current),
            Math.cos(yaw.current) * Math.cos(pitch.current)
        ).multiplyScalar(LOOK_DISTANCE)
        const lookTarget = camera.position.clone().add(lookDirection)
        camera.lookAt(lookTarget)
    })
}
