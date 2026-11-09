import React from 'react'

// Tree nodes: {name, color, value} for leaves, {name, color, children: [...]} for branches.
// Depth is variable per branch.

export const sumValue = node => {
    if (node.children) {
        return node.children.reduce((total, c) => total + sumValue(c), 0)
    }
    return node.value
}

const treeDepth = nodes => {
    let max = 0
    for (const n of nodes) {
        const d = 1 + (n.children ? treeDepth(n.children) : 0)
        if (d > max) {
            max = d
        }
    }
    return max
}

// Flatten the tree into arcs: {node, path, depth, start, end}
const layoutArcs = (nodes, depth, start, end, path, out) => {
    const total = nodes.reduce((t, n) => t + sumValue(n), 0)
    let cursor = start
    for (const n of nodes) {
        const span = (sumValue(n) / total) * (end - start)
        const here = [...path, n.name]
        out.push({node: n, path: here, depth, start: cursor, end: cursor + span})
        if (n.children) {
            layoutArcs(n.children, depth + 1, cursor, cursor + span, here, out)
        }
        cursor += span
    }
}

const polar = (cx, cy, r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)]

const arcPath = (cx, cy, r0, r1, a0, a1) => {
    const end = Math.min(a1, a0 + Math.PI * 2 - 0.0001)
    const large = end - a0 > Math.PI ? 1 : 0
    const [x0, y0] = polar(cx, cy, r1, a0)
    const [x1, y1] = polar(cx, cy, r1, end)
    const [x2, y2] = polar(cx, cy, r0, end)
    const [x3, y3] = polar(cx, cy, r0, a0)
    return `M${x0} ${y0} A${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`
}

export const Sunburst = props => {
    const {tree, onHover, hovered, onSelect, labelLeaves} = props
    const size = 320
    const c = size / 2
    const hole = 34
    const outer = c - 4
    const depth = treeDepth(tree)
    const ring = (outer - hole) / depth

    const arcs = []
    layoutArcs(tree, 0, 0, Math.PI * 2, [], arcs)

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-sm mx-auto">
            {arcs.map((a, i) => {
                const r0 = hole + a.depth * ring
                const r1 = r0 + ring - 1
                const dim = hovered && hovered.path[0] !== a.path[0]

                // Label category arcs (and leaves if asked) when the text fits
                const mid = (a.start + a.end) / 2
                const rMid = (r0 + r1) / 2
                const arcLength = rMid * (a.end - a.start)
                const showLabel = (a.node.children || labelLeaves) && arcLength > a.node.name.length * 6 + 8
                const [tx, ty] = polar(c, c, rMid, mid)
                let rotation = (mid * 180) / Math.PI
                if (Math.cos(mid) < 0) {
                    rotation += 180
                }

                return (
                    <g
                        key={i}
                        opacity={dim ? 0.35 : 1}
                        className="cursor-pointer"
                        onClick={() => onSelect?.(a.path)}
                        onMouseEnter={() => onHover({path: a.path, value: sumValue(a.node), node: a.node})}
                        onMouseLeave={() => onHover(null)}>
                        <path
                            d={arcPath(c, c, r0, r1, a.start, a.end)}
                            fill={a.node.color}
                            stroke="#fff"
                            strokeWidth="1"
                        />
                        {showLabel && (
                            <text
                                x={tx}
                                y={ty}
                                transform={`rotate(${rotation} ${tx} ${ty})`}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="10"
                                fontWeight="600"
                                fill="#fff"
                                pointerEvents="none">
                                {a.node.name}
                            </text>
                        )}
                    </g>
                )
            })}
        </svg>
    )
}
