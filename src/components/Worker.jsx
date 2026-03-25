import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const VEST_COLORS = ['#ff6b00', '#ffcc00', '#00cc44']
const HELMET_COLORS = ['#ffffff', '#ffcc00', '#ff4444', '#2196f3']
const GLOVE_COLORS = ['#4a4a4a', '#e65100', '#1b5e20']
const SKIN_TONES = ['#d4a574', '#c49a6c', '#8d5524', '#6b3a2a', '#f5c6a0']
const TASK_SPEEDS = {
    patrol: 1.1,
    inspect: 0.95,
    sort: 0.9,
    carry: 1.25,
    lift: 0.85,
}
const TASK_PAUSES = {
    patrol: 0.4,
    inspect: 1.6,
    sort: 1.8,
    carry: 0.9,
    lift: 2.1,
}
const OBSTACLE_CLEARANCE = 0.95
const QR_GRID_SIZE = 21
const GRID_CELL_SIZE = 0.75

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function toVector(point) {
    return new THREE.Vector3(point[0], point[1], point[2])
}

function hashString(value) {
    let hash = 2166136261

    for (const char of value) {
        hash ^= char.charCodeAt(0)
        hash = Math.imul(hash, 16777619)
    }

    return hash >>> 0
}

function drawFinderPattern(ctx, x, y, cellSize, offsetX, offsetY) {
    const layers = [
        { offset: 0, size: 7, color: '#000000' },
        { offset: 1, size: 5, color: '#ffffff' },
        { offset: 2, size: 3, color: '#000000' },
    ]

    layers.forEach(({ offset, size, color }) => {
        ctx.fillStyle = color
        ctx.fillRect(
            offsetX + (x + offset) * cellSize,
            offsetY + (y + offset) * cellSize,
            size * cellSize,
            size * cellSize
        )
    })
}

function createQrBadgeTexture(workerId) {
    const canvas = document.createElement('canvas')
    const size = 256
    const margin = 20
    const labelHeight = 34
    const matrixPixels = size - margin * 2 - labelHeight
    const cellSize = Math.floor(matrixPixels / QR_GRID_SIZE)
    const actualMatrixSize = cellSize * QR_GRID_SIZE
    const offsetX = Math.floor((size - actualMatrixSize) / 2)
    const offsetY = margin
    const hash = hashString(`worker:${workerId}`)
    const reserved = new Set()
    const ctx = canvas.getContext('2d')

    canvas.width = size
    canvas.height = size

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    const markReservedSquare = (startX, startY) => {
        for (let y = startY; y < startY + 7; y += 1) {
            for (let x = startX; x < startX + 7; x += 1) {
                reserved.add(`${x},${y}`)
            }
        }
    }

    markReservedSquare(0, 0)
    markReservedSquare(QR_GRID_SIZE - 7, 0)
    markReservedSquare(0, QR_GRID_SIZE - 7)

    drawFinderPattern(ctx, 0, 0, cellSize, offsetX, offsetY)
    drawFinderPattern(ctx, QR_GRID_SIZE - 7, 0, cellSize, offsetX, offsetY)
    drawFinderPattern(ctx, 0, QR_GRID_SIZE - 7, cellSize, offsetX, offsetY)

    for (let y = 0; y < QR_GRID_SIZE; y += 1) {
        for (let x = 0; x < QR_GRID_SIZE; x += 1) {
            if (reserved.has(`${x},${y}`)) {
                continue
            }

            const bit = ((hash >> ((x * 5 + y * 3) % 32)) & 1) ^ ((x + y) % 2)

            if (bit) {
                ctx.fillStyle = '#000000'
                ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize)
            }
        }
    }

    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 6
    ctx.strokeRect(offsetX - 8, offsetY - 8, actualMatrixSize + 16, actualMatrixSize + 16)

    ctx.fillStyle = '#111827'
    ctx.font = 'bold 22px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(workerId, size / 2, size - 10)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true
    return texture
}

function almostSamePoint(a, b) {
    return a.distanceToSquared(b) < 0.04
}

function pointInsideRect(point, rect) {
    return (
        point.x >= rect.minX &&
        point.x <= rect.maxX &&
        point.z >= rect.minZ &&
        point.z <= rect.maxZ
    )
}

function orientation(a, b, c) {
    const value = (b.z - a.z) * (c.x - b.x) - (b.x - a.x) * (c.z - b.z)

    if (Math.abs(value) < 1e-6) return 0
    return value > 0 ? 1 : 2
}

function onSegment(a, b, c) {
    return (
        Math.min(a.x, c.x) <= b.x &&
        b.x <= Math.max(a.x, c.x) &&
        Math.min(a.z, c.z) <= b.z &&
        b.z <= Math.max(a.z, c.z)
    )
}

function segmentsIntersect(a, b, c, d) {
    const o1 = orientation(a, b, c)
    const o2 = orientation(a, b, d)
    const o3 = orientation(c, d, a)
    const o4 = orientation(c, d, b)

    if (o1 !== o2 && o3 !== o4) return true
    if (o1 === 0 && onSegment(a, c, b)) return true
    if (o2 === 0 && onSegment(a, d, b)) return true
    if (o3 === 0 && onSegment(c, a, d)) return true
    if (o4 === 0 && onSegment(c, b, d)) return true
    return false
}

function expandObstacle(obstacle, margin) {
    return {
        minX: obstacle.minX - margin,
        maxX: obstacle.maxX + margin,
        minZ: obstacle.minZ - margin,
        maxZ: obstacle.maxZ + margin,
    }
}

function segmentIntersectsRect(start, end, rect) {
    if (pointInsideRect(start, rect) || pointInsideRect(end, rect)) {
        return true
    }

    const topLeft = new THREE.Vector3(rect.minX, 0, rect.minZ)
    const topRight = new THREE.Vector3(rect.maxX, 0, rect.minZ)
    const bottomLeft = new THREE.Vector3(rect.minX, 0, rect.maxZ)
    const bottomRight = new THREE.Vector3(rect.maxX, 0, rect.maxZ)

    return (
        segmentsIntersect(start, end, topLeft, topRight) ||
        segmentsIntersect(start, end, topRight, bottomRight) ||
        segmentsIntersect(start, end, bottomRight, bottomLeft) ||
        segmentsIntersect(start, end, bottomLeft, topLeft)
    )
}

function sanitizePoints(points) {
    return points.filter((point, index) => {
        if (index === 0) return true
        return !almostSamePoint(point, points[index - 1])
    })
}

function keyForCell(cell) {
    return `${cell.x},${cell.z}`
}

function deriveBounds(points, obstacles) {
    const xs = points.map((point) => point.x)
    const zs = points.map((point) => point.z)

    obstacles.forEach((obstacle) => {
        xs.push(obstacle.minX, obstacle.maxX)
        zs.push(obstacle.minZ, obstacle.maxZ)
    })

    return {
        minX: Math.min(...xs) - 2,
        maxX: Math.max(...xs) + 2,
        minZ: Math.min(...zs) - 2,
        maxZ: Math.max(...zs) + 2,
    }
}

function toCell(point, bounds) {
    return {
        x: Math.round((point.x - bounds.minX) / GRID_CELL_SIZE),
        z: Math.round((point.z - bounds.minZ) / GRID_CELL_SIZE),
    }
}

function toWorld(cell, bounds) {
    return new THREE.Vector3(
        bounds.minX + cell.x * GRID_CELL_SIZE,
        0,
        bounds.minZ + cell.z * GRID_CELL_SIZE
    )
}

function buildBlockedCells(bounds, obstacles) {
    const blocked = new Set()

    obstacles.forEach((obstacle) => {
        const expanded = expandObstacle(obstacle, OBSTACLE_CLEARANCE)
        const minCellX = Math.floor((expanded.minX - bounds.minX) / GRID_CELL_SIZE)
        const maxCellX = Math.ceil((expanded.maxX - bounds.minX) / GRID_CELL_SIZE)
        const minCellZ = Math.floor((expanded.minZ - bounds.minZ) / GRID_CELL_SIZE)
        const maxCellZ = Math.ceil((expanded.maxZ - bounds.minZ) / GRID_CELL_SIZE)

        for (let x = minCellX; x <= maxCellX; x += 1) {
            for (let z = minCellZ; z <= maxCellZ; z += 1) {
                blocked.add(keyForCell({ x, z }))
            }
        }
    })

    return blocked
}

function findNearestFreeCell(startCell, blocked, bounds) {
    const queue = [startCell]
    const visited = new Set([keyForCell(startCell)])
    const maxRadius = Math.ceil(
        Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ) / GRID_CELL_SIZE
    )

    while (queue.length) {
        const cell = queue.shift()

        if (!blocked.has(keyForCell(cell))) {
            return cell
        }

        const neighbors = [
            { x: cell.x + 1, z: cell.z },
            { x: cell.x - 1, z: cell.z },
            { x: cell.x, z: cell.z + 1 },
            { x: cell.x, z: cell.z - 1 },
        ]

        neighbors.forEach((neighbor) => {
            const key = keyForCell(neighbor)

            if (
                !visited.has(key) &&
                Math.abs(neighbor.x - startCell.x) <= maxRadius &&
                Math.abs(neighbor.z - startCell.z) <= maxRadius
            ) {
                visited.add(key)
                queue.push(neighbor)
            }
        })
    }

    return startCell
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z)
}

function reconstructCellPath(cameFrom, current) {
    const path = [current]
    let cursor = current

    while (cameFrom.has(keyForCell(cursor))) {
        cursor = cameFrom.get(keyForCell(cursor))
        path.push(cursor)
    }

    return path.reverse()
}

function findGridPath(start, end, blocked, bounds, obstacles) {
    const rawStartCell = toCell(start, bounds)
    const rawEndCell = toCell(end, bounds)
    const startCell = findNearestFreeCell(rawStartCell, blocked, bounds)
    const endCell = findNearestFreeCell(rawEndCell, blocked, bounds)
    const open = [startCell]
    const cameFrom = new Map()
    const gScore = new Map([[keyForCell(startCell), 0]])
    const fScore = new Map([[keyForCell(startCell), heuristic(startCell, endCell)]])
    const seen = new Set([keyForCell(startCell)])

    while (open.length) {
        open.sort((a, b) => (fScore.get(keyForCell(a)) ?? Infinity) - (fScore.get(keyForCell(b)) ?? Infinity))
        const current = open.shift()
        const currentKey = keyForCell(current)

        if (current.x === endCell.x && current.z === endCell.z) {
            const cellPath = reconstructCellPath(cameFrom, current)
            const worldPath = cellPath.map((cell) => toWorld(cell, bounds))
            worldPath[0] = start.clone()
            worldPath[worldPath.length - 1] = end.clone()
            return worldPath
        }

        const neighbors = [
            { x: current.x + 1, z: current.z },
            { x: current.x - 1, z: current.z },
            { x: current.x, z: current.z + 1 },
            { x: current.x, z: current.z - 1 },
        ]

        neighbors.forEach((neighbor) => {
            const neighborKey = keyForCell(neighbor)
            const worldNeighbor = toWorld(neighbor, bounds)

            if (
                blocked.has(neighborKey) ||
                obstacles.some((obstacle) => pointInsideRect(worldNeighbor, expandObstacle(obstacle, OBSTACLE_CLEARANCE)))
            ) {
                return
            }

            const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1

            if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
                cameFrom.set(neighborKey, current)
                gScore.set(neighborKey, tentativeG)
                fScore.set(neighborKey, tentativeG + heuristic(neighbor, endCell))

                if (!seen.has(neighborKey)) {
                    seen.add(neighborKey)
                    open.push(neighbor)
                }
            }
        })
    }

    return [start.clone(), end.clone()]
}

function simplifyPath(points, obstacles) {
    if (points.length <= 2) {
        return points
    }

    const simplified = [points[0]]
    let anchor = points[0]

    for (let i = 1; i < points.length; i += 1) {
        const candidate = points[i]
        const blocked = obstacles.some((obstacle) =>
            segmentIntersectsRect(anchor, candidate, expandObstacle(obstacle, OBSTACLE_CLEARANCE))
        )

        if (blocked) {
            const previous = points[i - 1]

            if (!almostSamePoint(previous, simplified[simplified.length - 1])) {
                simplified.push(previous)
            }

            anchor = previous
        }
    }

    simplified.push(points[points.length - 1])
    return sanitizePoints(simplified)
}

function createNavigablePath(route, obstacles) {
    const points = route.map(toVector)

    if (points.length <= 1 || !obstacles?.length) {
        return points
    }

    const bounds = deriveBounds(points, obstacles)
    const blocked = buildBlockedCells(bounds, obstacles)
    let path = [points[0]]

    for (let i = 1; i < points.length; i += 1) {
        const segmentPath = findGridPath(path[path.length - 1], points[i], blocked, bounds, obstacles)
        path = [...path, ...segmentPath.slice(1)]
    }

    return simplifyPath(sanitizePoints(path), obstacles)
}

export default function Worker({
    id,
    route,
    speed = 1,
    taskType = 'patrol',
    workerIndex = 0,
    obstacles = [],
    ppeConfig,
}) {
    const group = useRef()
    const leftArm = useRef()
    const rightArm = useRef()
    const leftLeg = useRef()
    const rightLeg = useRef()
    const bodyBob = useRef()
    const carriedLoad = useRef()

    const skinTone = useMemo(() => randomFrom(SKIN_TONES), [])
    const helmetColor = useMemo(() => randomFrom(HELMET_COLORS), [])
    const vestColor = useMemo(() => randomFrom(VEST_COLORS), [])
    const gloveColor = useMemo(() => randomFrom(GLOVE_COLORS), [])
    const qrBadgeTexture = useMemo(() => createQrBadgeTexture(id), [id])
    const path = useMemo(() => createNavigablePath(route, obstacles), [route, obstacles])
    const phaseOffset = useMemo(() => workerIndex * 0.47, [workerIndex])
    const baseMoveSpeed = useMemo(
        () => TASK_SPEEDS[taskType] * (0.92 + (workerIndex % 4) * 0.05),
        [taskType, workerIndex]
    )
    const positionRef = useRef(path[0]?.clone() ?? new THREE.Vector3())
    const waypointIndex = useRef(path.length > 1 ? 1 : 0)
    const pauseUntil = useRef(phaseOffset * 0.18)
    const isPaused = useRef(path.length <= 1)
    const motionState = useRef(path.length > 1 ? 'walking' : 'working')

    useFrame(({ clock }, delta) => {
        const t = clock.getElapsedTime() * speed + phaseOffset
        const position = positionRef.current
        const target = path[waypointIndex.current]

        if (group.current) {
            group.current.position.copy(position)
        }

        if (path.length > 1) {
            if (isPaused.current) {
                if (t >= pauseUntil.current) {
                    isPaused.current = false
                    motionState.current = taskType === 'carry' ? 'carrying' : 'walking'
                    waypointIndex.current = (waypointIndex.current + 1) % path.length
                }
            } else if (target) {
                const direction = target.clone().sub(position)
                const distance = direction.length()

                if (distance < 0.14) {
                    isPaused.current = true
                    pauseUntil.current = t + TASK_PAUSES[taskType]
                    motionState.current = 'working'
                } else {
                    direction.normalize()
                    const step = Math.min(distance, baseMoveSpeed * speed * delta)
                    position.addScaledVector(direction, step)

                    if (group.current) {
                        group.current.rotation.y = Math.atan2(direction.x, direction.z)
                    }

                    motionState.current = taskType === 'carry' ? 'carrying' : 'walking'
                }
            }
        }

        if (bodyBob.current) {
            bodyBob.current.position.y = 0
            bodyBob.current.rotation.z = 0
            bodyBob.current.rotation.x = 0
        }

        if (leftArm.current) leftArm.current.rotation.x = 0
        if (rightArm.current) rightArm.current.rotation.x = 0
        if (leftLeg.current) leftLeg.current.rotation.x = 0
        if (rightLeg.current) rightLeg.current.rotation.x = 0

        if (motionState.current === 'walking' || motionState.current === 'carrying') {
            const swing = Math.sin(t * 5) * (motionState.current === 'carrying' ? 0.25 : 0.6)
            if (leftArm.current) leftArm.current.rotation.x = swing
            if (rightArm.current) rightArm.current.rotation.x = -swing
            if (leftLeg.current) leftLeg.current.rotation.x = -swing * 0.8
            if (rightLeg.current) rightLeg.current.rotation.x = swing * 0.8
            if (bodyBob.current) bodyBob.current.position.y = Math.abs(Math.sin(t * 5)) * 0.05
        } else if (taskType === 'lift') {
            const heave = Math.sin(t * 3.4) * 0.45
            if (leftArm.current) leftArm.current.rotation.x = -1.1 + heave * 0.4
            if (rightArm.current) rightArm.current.rotation.x = -1.1 + heave * 0.4
            if (leftLeg.current) leftLeg.current.rotation.x = 0.18
            if (rightLeg.current) rightLeg.current.rotation.x = 0.18
            if (bodyBob.current) {
                bodyBob.current.position.y = -0.04 + Math.abs(heave) * 0.08
                bodyBob.current.rotation.x = 0.1
            }
        } else if (taskType === 'sort') {
            if (rightArm.current) rightArm.current.rotation.x = -0.9 + Math.sin(t * 4.5) * 0.45
            if (leftArm.current) leftArm.current.rotation.x = -0.25 + Math.sin(t * 3.2) * 0.25
            if (bodyBob.current) bodyBob.current.rotation.z = Math.sin(t * 2.4) * 0.06
        } else if (taskType === 'inspect') {
            if (rightArm.current) rightArm.current.rotation.x = -0.45 + Math.sin(t * 2.5) * 0.12
            if (leftArm.current) leftArm.current.rotation.x = Math.sin(t * 1.8) * 0.08
            if (bodyBob.current) bodyBob.current.position.y = Math.sin(t * 1.6) * 0.02
        } else {
            const sway = Math.sin(t * 1.4) * 0.1
            if (leftArm.current) leftArm.current.rotation.x = sway
            if (rightArm.current) rightArm.current.rotation.x = -sway * 0.5
            if (bodyBob.current) bodyBob.current.position.y = Math.sin(t * 1.5) * 0.02
        }

        if (carriedLoad.current) {
            carriedLoad.current.visible = taskType === 'carry' || taskType === 'lift'
            carriedLoad.current.position.y = taskType === 'lift' && motionState.current === 'working' ? 0.94 : 1.02
            carriedLoad.current.rotation.z = taskType === 'carry' ? Math.sin(t * 5) * 0.03 : 0
        }
    })

    const pantsColor = '#1a365d'
    const shirtColor = '#2d3748'
    const bootColor = '#1a1a1a'
    const sleeveColor = '#1f2937'

    return (
        <group ref={group} position={path[0] ?? route[0]} scale={[1.05, 1.05, 1.05]}>
            <group ref={bodyBob}>
                {/* Legs */}
                <group ref={leftLeg} position={[-0.12, 0.86, 0]}>
                    <mesh position={[0, -0.22, 0]} castShadow>
                        <boxGeometry args={[0.16, 0.44, 0.17]} />
                        <meshStandardMaterial color={pantsColor} />
                    </mesh>
                    <mesh position={[0, -0.65, 0.02]} castShadow>
                        <boxGeometry args={[0.14, 0.4, 0.14]} />
                        <meshStandardMaterial color="#243b5b" />
                    </mesh>
                    <mesh position={[0, -0.88, 0.07]} castShadow>
                        <boxGeometry args={[0.16, 0.08, 0.26]} />
                        <meshStandardMaterial color={bootColor} />
                    </mesh>
                </group>
                <group ref={rightLeg} position={[0.12, 0.86, 0]}>
                    <mesh position={[0, -0.22, 0]} castShadow>
                        <boxGeometry args={[0.16, 0.44, 0.17]} />
                        <meshStandardMaterial color={pantsColor} />
                    </mesh>
                    <mesh position={[0, -0.65, 0.02]} castShadow>
                        <boxGeometry args={[0.14, 0.4, 0.14]} />
                        <meshStandardMaterial color="#243b5b" />
                    </mesh>
                    <mesh position={[0, -0.88, 0.07]} castShadow>
                        <boxGeometry args={[0.16, 0.08, 0.26]} />
                        <meshStandardMaterial color={bootColor} />
                    </mesh>
                </group>

                {/* Torso */}
                <mesh position={[0, 0.97, 0]} castShadow>
                    <boxGeometry args={[0.34, 0.28, 0.22]} />
                    <meshStandardMaterial color="#374151" />
                </mesh>
                <mesh position={[0, 1.24, 0]} castShadow>
                    <boxGeometry args={[0.42, 0.48, 0.24]} />
                    <meshStandardMaterial color={shirtColor} />
                </mesh>
                <mesh position={[0, 1.51, 0]} castShadow>
                    <boxGeometry args={[0.12, 0.1, 0.12]} />
                    <meshStandardMaterial color={skinTone} />
                </mesh>
                <mesh ref={carriedLoad} position={[0, 1.04, 0.26]} castShadow>
                    <boxGeometry args={[0.24, 0.18, 0.18]} />
                    <meshStandardMaterial color="#a16207" roughness={0.8} />
                </mesh>

                {/* Safety Vest */}
                {ppeConfig.vest && (
                    <>
                        <mesh position={[0, 1.23, 0.01]} castShadow>
                            <boxGeometry args={[0.44, 0.5, 0.25]} />
                            <meshStandardMaterial color={vestColor} transparent opacity={0.85} />
                        </mesh>
                        <mesh position={[0, 1.31, 0.14]}>
                            <boxGeometry args={[0.45, 0.05, 0.01]} />
                            <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
                        </mesh>
                        <mesh position={[0, 1.13, 0.14]}>
                            <boxGeometry args={[0.45, 0.05, 0.01]} />
                            <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
                        </mesh>
                    </>
                )}

                {/* Arms */}
                <group ref={leftArm} position={[-0.28, 1.34, 0]}>
                    <mesh position={[0, -0.17, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.32, 0.12]} />
                        <meshStandardMaterial color={sleeveColor} />
                    </mesh>
                    <mesh position={[0, -0.48, 0]} castShadow>
                        <boxGeometry args={[0.11, 0.3, 0.11]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>
                    <mesh position={[-0.066, -0.14, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                        <planeGeometry args={[0.18, 0.18]} />
                        <meshBasicMaterial map={qrBadgeTexture} toneMapped={false} />
                    </mesh>
                    <mesh position={[0, -0.68, 0.02]} castShadow>
                        <sphereGeometry args={[0.055, 8, 8]} />
                        <meshStandardMaterial color={ppeConfig.gloves ? gloveColor : skinTone} />
                    </mesh>
                </group>
                <group ref={rightArm} position={[0.28, 1.34, 0]}>
                    <mesh position={[0, -0.17, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.32, 0.12]} />
                        <meshStandardMaterial color={sleeveColor} />
                    </mesh>
                    <mesh position={[0, -0.48, 0]} castShadow>
                        <boxGeometry args={[0.11, 0.3, 0.11]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>
                    <mesh position={[0.066, -0.14, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
                        <planeGeometry args={[0.18, 0.18]} />
                        <meshBasicMaterial map={qrBadgeTexture} toneMapped={false} />
                    </mesh>
                    <mesh position={[0, -0.68, 0.02]} castShadow>
                        <sphereGeometry args={[0.055, 8, 8]} />
                        <meshStandardMaterial color={ppeConfig.gloves ? gloveColor : skinTone} />
                    </mesh>
                </group>

                {/* Head */}
                <mesh position={[0, 1.7, 0]} castShadow>
                    <sphereGeometry args={[0.15, 14, 12]} />
                    <meshStandardMaterial color={skinTone} />
                </mesh>
                <mesh position={[-0.05, 1.72, 0.13]}>
                    <sphereGeometry args={[0.018, 6, 6]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                <mesh position={[0.05, 1.72, 0.13]}>
                    <sphereGeometry args={[0.018, 6, 6]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                <mesh position={[0, 1.63, 0.14]}>
                    <boxGeometry args={[0.06, 0.02, 0.02]} />
                    <meshStandardMaterial color="#b45309" />
                </mesh>

                {/* Helmet */}
                {ppeConfig.helmet && (
                    <group position={[0, 1.86, 0]}>
                        <mesh castShadow>
                            <sphereGeometry args={[0.18, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            <meshStandardMaterial color={helmetColor} roughness={0.4} />
                        </mesh>
                        <mesh position={[0, -0.02, 0]} castShadow>
                            <cylinderGeometry args={[0.19, 0.21, 0.04, 14]} />
                            <meshStandardMaterial color={helmetColor} roughness={0.4} />
                        </mesh>
                        <mesh position={[0, -0.04, 0.12]} castShadow>
                            <boxGeometry args={[0.18, 0.02, 0.08]} />
                            <meshStandardMaterial color={helmetColor} roughness={0.4} />
                        </mesh>
                    </group>
                )}

                {/* Floating label */}
                <Html position={[0, 2.32, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                    <div
                        style={{
                            background: 'rgba(30,41,59,0.85)',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: "'Inter', sans-serif",
                            whiteSpace: 'nowrap',
                            border: '1px solid rgba(255,255,255,0.1)',
                            userSelect: 'none',
                        }}
                    >
                        {id}
                    </div>
                </Html>
            </group>
        </group>
    )
}
