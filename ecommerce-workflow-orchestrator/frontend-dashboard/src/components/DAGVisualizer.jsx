import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node styles based on status
const getStatusColors = (status) => {
  switch (status) {
    case 'completed':
      return {
        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
        color: '#ffffff',
        border: '2px solid #16a34a',
        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
      };
    case 'running':
      return {
        background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
        color: '#ffffff',
        border: '2px solid #2563eb',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
        animation: 'pulse 2s infinite',
      };
    case 'failed':
      return {
        background: 'linear-gradient(135deg, #f87171, #ef4444)',
        color: '#ffffff',
        border: '2px solid #dc2626',
        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
      };
    case 'skipped':
      return {
        background: 'linear-gradient(135deg, #cbd5e1, #94a3b8)',
        color: '#475569',
        border: '2px solid #64748b',
        boxShadow: 'none',
      };
    case 'pending':
    default:
      return {
        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        color: '#64748b',
        border: '2px solid #cbd5e1',
        boxShadow: 'none',
      };
  }
};

const DAGVisualizer = ({ taskStatuses = {} }) => {
  // Define nodes dynamically based on execution status
  const nodes = useMemo(() => {
    const defaultNodes = [
      { id: 'start', label: 'Order Placed', x: 250, y: 30, status: 'completed' },
      { id: 'payment', label: 'Payment Gateway', x: 250, y: 130, status: taskStatuses['payment'] || 'pending' },
      { id: 'inventory', label: 'Inventory Check', x: 250, y: 230, status: taskStatuses['inventory'] || 'pending' },
      { id: 'shipping', label: 'Shipping Dispatch', x: 250, y: 330, status: taskStatuses['shipping'] || 'pending' },
      { id: 'notification', label: 'Send Alert (n8n)', x: 250, y: 430, status: taskStatuses['notification'] || 'pending' },
      { id: 'complete', label: 'Order Completed', x: 250, y: 530, status: taskStatuses['complete'] || 'pending' },
      
      // Parallel failure/backorder branches
      { id: 'payment_fail', label: 'Order Cancelled', x: 480, y: 130, status: taskStatuses['payment'] === 'failed' ? 'failed' : 'pending' },
      { id: 'backorder', label: 'Backorder Initiated', x: 480, y: 230, status: taskStatuses['inventory'] === 'failed' ? 'failed' : 'pending' },
    ];

    return defaultNodes.map((node) => {
      const colors = getStatusColors(node.status);
      return {
        id: node.id,
        position: { x: node.x, y: node.y },
        data: { label: node.label },
        style: {
          ...colors,
          borderRadius: '16px',
          padding: '12px 18px',
          fontFamily: 'Outfit, Inter, sans-serif',
          fontWeight: 'bold',
          fontSize: '13px',
          textAlign: 'center',
          width: 170,
          transition: 'all 0.3s ease',
        },
      };
    });
  }, [taskStatuses]);

  // Define static edges connecting the DAG
  const edges = useMemo(() => {
    return [
      {
        id: 'e-start-payment',
        source: 'start',
        target: 'payment',
        animated: taskStatuses['payment'] === 'running',
        style: { stroke: taskStatuses['payment'] === 'completed' ? '#22c55e' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e-payment-inventory',
        source: 'payment',
        target: 'inventory',
        animated: taskStatuses['inventory'] === 'running',
        style: { stroke: taskStatuses['inventory'] === 'completed' ? '#22c55e' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e-payment-fail',
        source: 'payment',
        target: 'payment_fail',
        animated: taskStatuses['payment'] === 'failed',
        style: { stroke: taskStatuses['payment'] === 'failed' ? '#ef4444' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e-inventory-shipping',
        source: 'inventory',
        target: 'shipping',
        animated: taskStatuses['shipping'] === 'running',
        style: { stroke: taskStatuses['shipping'] === 'completed' ? '#22c55e' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e-inventory-fail',
        source: 'inventory',
        target: 'backorder',
        animated: taskStatuses['inventory'] === 'failed',
        style: { stroke: taskStatuses['inventory'] === 'failed' ? '#ef4444' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e-shipping-notification',
        source: 'shipping',
        target: 'notification',
        animated: taskStatuses['notification'] === 'running',
        style: { stroke: taskStatuses['notification'] === 'completed' ? '#22c55e' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e-notification-complete',
        source: 'notification',
        target: 'complete',
        animated: taskStatuses['complete'] === 'running',
        style: { stroke: taskStatuses['complete'] === 'completed' ? '#22c55e' : '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
  }, [taskStatuses]);

  return (
    <div style={{ width: '100%', height: '550px', background: '#f8fafc', borderRadius: '24px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={true}
        zoomOnScroll={false}
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
      
      {/* Keyframes for blue pulsing node effect */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default DAGVisualizer;
