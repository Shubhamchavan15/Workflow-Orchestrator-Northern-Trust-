import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

const getStatusColors = (status) => {
  switch (status) {
    case 'COMPLETED': return { background: 'linear-gradient(135deg,#4ade80,#22c55e)', color:'#fff', border:'2px solid #16a34a', boxShadow:'0 4px 15px rgba(34,197,94,0.3)' };
    case 'RUNNING':   return { background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', color:'#fff', border:'2px solid #2563eb', boxShadow:'0 4px 15px rgba(59,130,246,0.4)', animation:'pulse 2s infinite' };
    case 'FAILED':    return { background: 'linear-gradient(135deg,#f87171,#ef4444)', color:'#fff', border:'2px solid #dc2626', boxShadow:'0 4px 15px rgba(239,68,68,0.3)' };
    default:          return { background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', color:'#64748b', border:'2px solid #cbd5e1', boxShadow:'none' };
  }
};

const nodeStyle = (status) => ({
  ...getStatusColors(status),
  borderRadius: '16px', padding: '12px 18px',
  fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
  fontSize: '13px', textAlign: 'center', width: 170,
  transition: 'all 0.3s ease',
});

// Correct order: order_received → inventory → payment → shipping + notification (parallel) → completed
const DAGVisualizer = ({ taskStatuses = {} }) => {

  const s = (key) => taskStatuses[key] || 'PENDING';

  const nodes = useMemo(() => [
    // Main flow — left column
    { id: 'order_received', position: { x: 220, y: 20  }, data: { label: '📦 Order Received'   }, style: nodeStyle('COMPLETED') },
    { id: 'inventory',      position: { x: 220, y: 120 }, data: { label: '🗃️ Inventory Check'  }, style: nodeStyle(s('inventory')) },
    { id: 'payment',        position: { x: 220, y: 220 }, data: { label: '💳 Payment'           }, style: nodeStyle(s('payment')) },
    { id: 'shipping',       position: { x: 80,  y: 340 }, data: { label: '🚚 Shipping Dispatch' }, style: nodeStyle(s('shipping')) },
    { id: 'notification',   position: { x: 360, y: 340 }, data: { label: '🔔 Notification'      }, style: nodeStyle(s('notification')) },
    { id: 'completed',      position: { x: 220, y: 460 }, data: { label: '✅ Order Completed'   }, style: nodeStyle(s('completed')) },
    // Failure branches
    { id: 'inv_fail',  position: { x: 460, y: 120 }, data: { label: '❌ Out of Stock'      }, style: nodeStyle(s('inventory') === 'FAILED' ? 'FAILED' : 'PENDING') },
    { id: 'pay_fail',  position: { x: 460, y: 220 }, data: { label: '❌ Payment Declined'  }, style: nodeStyle(s('payment')   === 'FAILED' ? 'FAILED' : 'PENDING') },
  ], [taskStatuses]);

  const edgeStyle = (fromKey, toKey) => ({
    stroke: s(toKey) === 'COMPLETED' ? '#22c55e' : s(fromKey) === 'FAILED' ? '#ef4444' : '#cbd5e1',
    strokeWidth: 2,
  });

  const edges = useMemo(() => [
    { id: 'e1', source: 'order_received', target: 'inventory',    animated: s('inventory')   === 'RUNNING', style: edgeStyle('order_received','inventory'),  markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2', source: 'inventory',      target: 'payment',      animated: s('payment')     === 'RUNNING', style: edgeStyle('inventory','payment'),          markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3', source: 'payment',        target: 'shipping',     animated: s('shipping')    === 'RUNNING', style: edgeStyle('payment','shipping'),           markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e4', source: 'payment',        target: 'notification', animated: s('notification')=== 'RUNNING', style: edgeStyle('payment','notification'),       markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e5', source: 'shipping',       target: 'completed',    animated: s('completed')   === 'RUNNING', style: edgeStyle('shipping','completed'),         markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e6', source: 'notification',   target: 'completed',    animated: s('completed')   === 'RUNNING', style: edgeStyle('notification','completed'),     markerEnd: { type: MarkerType.ArrowClosed } },
    // Failure branches
    { id: 'ef1', source: 'inventory', target: 'inv_fail', animated: s('inventory') === 'FAILED', style: { stroke: s('inventory') === 'FAILED' ? '#ef4444' : '#e2e8f0', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'ef2', source: 'payment',   target: 'pay_fail', animated: s('payment')   === 'FAILED', style: { stroke: s('payment')   === 'FAILED' ? '#ef4444' : '#e2e8f0', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed } },
  ], [taskStatuses]);

  return (
    <div style={{ width: '100%', height: '560px', background: '#f8fafc', borderRadius: '24px', overflow: 'hidden' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable zoomOnScroll={false}>
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
      <style>{`@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,.7)}70%{box-shadow:0 0 0 10px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}`}</style>
    </div>
  );
};

export default DAGVisualizer;
