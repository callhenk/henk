# Workflow Builder - Refactored Structure

## Overview

The workflow builder has been refactored into a modular, maintainable structure with clear separation of concerns. Each component has a single responsibility and can be easily tested and modified.

## File Structure

```
workflow-builder/
├── index.tsx                    # Main orchestrator component
├── workflow-toolbar.tsx         # Toolbar with action buttons
├── workflow-instructions.tsx    # User instructions component
├── workflow-canvas.tsx          # ReactFlow canvas wrapper
├── node-types.tsx              # Custom node type definitions
├── node-editor-dialog.tsx      # Node editing dialog
├── connection-dialog.tsx        # Connection option dialog
├── template-selection-dialog.tsx # Template selection dialog
├── hooks/
│   ├── use-workflow-state.ts   # Workflow state management
│   └── use-workflow-history.ts # Undo/redo functionality
└── README.md                   # This documentation
```

## Component Responsibilities

### Main Components

1. **`index.tsx`** - Main orchestrator
   - Manages overall workflow state
   - Coordinates between all sub-components
   - Handles keyboard shortcuts
   - Manages dialog states

2. **`workflow-toolbar.tsx`** - Action toolbar
   - Contains all action buttons (undo, redo, add nodes, etc.)
   - Handles button states and disabled conditions
   - Provides user feedback for actions

3. **`workflow-instructions.tsx`** - User guidance
   - Displays helpful tips and instructions
   - Shows keyboard shortcuts
   - Explains interaction patterns

4. **`workflow-canvas.tsx`** - ReactFlow wrapper
   - Manages the ReactFlow canvas
   - Handles empty state display
   - Provides canvas-specific functionality

### Node System

5. **`node-types.tsx`** - Custom node definitions
   - Defines all custom node types (start, decision, action, end)
   - Contains node rendering logic
   - Manages node-specific styling and behavior

### Dialogs

6. **`node-editor-dialog.tsx`** - Node editing
   - Form for editing node properties
   - Handles different node types (action vs decision)
   - Manages form state and validation

7. **`connection-dialog.tsx`** - Connection options
   - Dialog for choosing connection labels
   - Used when connecting decision nodes
   - Simple option selection interface

8. **`template-selection-dialog.tsx`** - Template loading
   - Template selection interface
   - Category filtering
   - Template preview and selection

### Hooks

9. **`use-workflow-state.ts`** - State management
   - Manages nodes and edges state
   - Provides node/edge operations (add, delete)
   - Handles state updates and synchronization

10. **`use-workflow-history.ts`** - History management
    - Implements undo/redo functionality
    - Manages history stack
    - Handles state restoration

## Benefits of Refactoring

### Maintainability

- **Single Responsibility**: Each component has one clear purpose
- **Modularity**: Components can be easily replaced or modified
- **Testability**: Individual components can be tested in isolation
- **Reusability**: Components can be reused in other contexts

### Code Organization

- **Clear Structure**: Logical file organization
- **Separation of Concerns**: UI, logic, and state are separated
- **Type Safety**: Proper TypeScript interfaces throughout
- **Consistent Patterns**: Similar patterns across components

### Performance

- **Optimized Rendering**: Components only re-render when necessary
- **Memoization**: Callbacks are properly memoized
- **Efficient State Updates**: Minimal state updates

### Developer Experience

- **Easy Debugging**: Issues can be isolated to specific components
- **Clear Interfaces**: Well-defined props and interfaces
- **Documentation**: Each component is self-documenting
- **Extensibility**: Easy to add new features

## Usage

```tsx
import { WorkflowBuilder } from './workflow-builder';

function AgentDetailPage() {
  return (
    <div>
      <WorkflowBuilder />
    </div>
  );
}
```

## Adding New Features

### Adding a New Node Type

1. Add the node component to `node-types.tsx`
2. Update the `nodeTypes` export
3. Add any necessary styling or behavior

### Adding a New Dialog

1. Create a new dialog component
2. Add it to the main `index.tsx` component
3. Manage its state in the main component

### Adding New Actions

1. Add the action to `workflow-toolbar.tsx`
2. Implement the logic in `use-workflow-state.ts`
3. Update the main component to handle the action

## Testing Strategy

Each component can be tested independently:

```tsx
// Test individual components
import { useWorkflowHistory } from './hooks/use-workflow-history';
// Test hooks
import { useWorkflowState } from './hooks/use-workflow-state';
import { NodeEditorDialog } from './node-editor-dialog';
import { WorkflowToolbar } from './workflow-toolbar';
```

## Future Enhancements

- **Plugin System**: Allow custom node types to be added
- **Workflow Validation**: Add validation rules and error checking
- **Export/Import**: Save and load workflow configurations
- **Collaboration**: Real-time collaboration features
- **Analytics**: Track workflow usage and performance
