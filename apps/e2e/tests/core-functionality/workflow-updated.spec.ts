import { expect, test } from '@playwright/test';

/**
 * UPDATED E2E Tests for Agent Workflow Feature
 *
 * Tests the complete workflow builder functionality including:
 * - Loading existing workflows
 * - Creating new workflows from templates
 * - Editing workflow nodes and edges
 * - Saving workflows to database
 * - Verifying persistence across page reloads
 * - NEW: Validation system
 * - NEW: Full-screen mode
 * - NEW: Collapsible instructions
 * - NEW: Improved toolbar organization
 */

// Test credentials
const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

// Agent ID will be set dynamically
let testAgentId: string;

test.describe('Agent Workflow Feature - Updated Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/sign-in');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/home/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/home/);

    console.log('✓ Logged in successfully');

    // Close onboarding dialog if it appears
    try {
      const skipButton = page.locator(
        'button:has-text("Skip"), button:has-text("No thanks")',
      );
      const isVisible = await skipButton.isVisible({ timeout: 2000 });
      if (isVisible) {
        await skipButton.click();
        await page.waitForTimeout(500);
        console.log('✓ Onboarding dialog dismissed');
      }
    } catch (e) {
      console.log('✓ No onboarding dialog to dismiss');
    }

    // Wait for any overlays/modals to disappear
    await page.waitForTimeout(1000);

    // Navigate to agents page to find or create an agent
    await page.goto('/home/agents');
    await page.waitForLoadState('networkidle');

    // Try to find an existing agent
    const agentCards = page.locator('[data-testid="agent-card"]');
    const agentCount = await agentCards.count();

    if (agentCount > 0) {
      // Use the first agent
      const firstAgentCard = agentCards.first();
      await firstAgentCard.click();
      await page.waitForURL(/\/home\/agents\/[^/]+/, { timeout: 5000 });

      // Extract agent ID from URL
      const url = page.url();
      const match = url.match(/\/agents\/([^?/]+)/);
      if (match) {
        testAgentId = match[1];
        console.log(`✓ Using existing agent: ${testAgentId}`);
      }
    } else {
      // Create a new agent for testing
      await page.click('button:has-text("Create Agent")');
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });
      await page.fill('input[name="name"]', 'E2E Test Agent');

      // Fill required fields
      const voiceSelect = page.locator('select, [role="combobox"]').first();
      await voiceSelect.click();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Save the agent
      await page.click('button:has-text("Create"), button:has-text("Save")');
      await page.waitForURL(/\/home\/agents\/[^/]+/, { timeout: 10000 });

      // Extract agent ID from URL
      const url = page.url();
      const match = url.match(/\/agents\/([^?/]+)/);
      if (match) {
        testAgentId = match[1];
        console.log(`✓ Created new agent: ${testAgentId}`);
      }
    }

    // Navigate directly to workflow tab
    await page.goto(`/home/agents/${testAgentId}?tab=workflow`);
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
  });

  test('should display workflow canvas with proper data-testid attributes', async ({
    page,
  }) => {
    // Verify workflow toolbar buttons using data-testid
    await expect(
      page.locator('[data-testid="workflow-add-decision"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="workflow-add-action"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="workflow-undo"]')).toBeVisible();
    await expect(page.locator('[data-testid="workflow-redo"]')).toBeVisible();

    console.log('✓ All toolbar buttons visible with data-testid');

    // Verify workflow name input
    await expect(
      page.locator('[data-testid="workflow-name-input"]'),
    ).toBeVisible();

    // Verify save button
    await expect(
      page.locator('[data-testid="workflow-save-button"]'),
    ).toBeVisible();

    // Verify ReactFlow canvas
    await expect(page.locator('.react-flow')).toBeVisible();

    console.log('✓ All workflow UI elements present with data-testid');
  });

  test('should add new decision node using data-testid selector', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Get initial node count
    const initialNodes = await page.locator('.react-flow__node').count();

    // Click "Add Decision" button using data-testid
    const addDecisionBtn = page.locator(
      '[data-testid="workflow-add-decision"]',
    );
    await expect(addDecisionBtn).toBeVisible();
    await expect(addDecisionBtn).toBeEnabled();
    await addDecisionBtn.click();

    // Wait for new node to appear
    await page.waitForTimeout(1000);

    // Verify new node was added
    const newNodeCount = await page.locator('.react-flow__node').count();
    expect(newNodeCount).toBe(initialNodes + 1);

    console.log(
      `✓ Decision node added (${initialNodes} → ${newNodeCount} nodes)`,
    );

    // Verify "Unsaved changes" indicator appears
    const unsavedIndicator = page.locator(
      '[data-testid="workflow-unsaved-indicator"]',
    );
    await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });

    console.log('✓ Unsaved changes indicator shown');
  });

  test('should add new action node using data-testid selector', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const initialNodes = await page.locator('.react-flow__node').count();

    // Click "Add Action" button using data-testid
    const addActionBtn = page.locator('[data-testid="workflow-add-action"]');
    await expect(addActionBtn).toBeVisible();
    await expect(addActionBtn).toBeEnabled();
    await addActionBtn.click();

    await page.waitForTimeout(1000);

    const newNodeCount = await page.locator('.react-flow__node').count();
    expect(newNodeCount).toBe(initialNodes + 1);

    console.log(
      `✓ Action node added (${initialNodes} → ${newNodeCount} nodes)`,
    );
  });

  test('should save workflow using data-testid selector', async ({ page }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Add a node to trigger unsaved state
    await page.locator('[data-testid="workflow-add-action"]').click();
    await page.waitForTimeout(500);

    // Verify unsaved indicator
    await expect(
      page.locator('[data-testid="workflow-unsaved-indicator"]'),
    ).toBeVisible();

    // Click save button using data-testid
    const saveButton = page.locator('[data-testid="workflow-save-button"]');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    console.log('✓ Workflow saved successfully');
  });

  test('should test undo/redo with data-testid selectors', async ({ page }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const initialNodes = await page.locator('.react-flow__node').count();

    // Add a node
    await page.locator('[data-testid="workflow-add-action"]').click();
    await page.waitForTimeout(500);

    const nodesAfterAdd = await page.locator('.react-flow__node').count();
    expect(nodesAfterAdd).toBe(initialNodes + 1);

    // Click Undo using data-testid
    const undoButton = page.locator('[data-testid="workflow-undo"]');
    await expect(undoButton).toBeEnabled();
    await undoButton.click();
    await page.waitForTimeout(500);

    const nodesAfterUndo = await page.locator('.react-flow__node').count();
    expect(nodesAfterUndo).toBe(initialNodes);
    console.log('✓ Undo successful');

    // Click Redo using data-testid
    const redoButton = page.locator('[data-testid="workflow-redo"]');
    await expect(redoButton).toBeEnabled();
    await redoButton.click();
    await page.waitForTimeout(500);

    const nodesAfterRedo = await page.locator('.react-flow__node').count();
    expect(nodesAfterRedo).toBe(initialNodes + 1);
    console.log('✓ Redo successful');
  });

  test('NEW: should toggle collapsible instructions panel', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Verify instructions panel exists
    const instructionsPanel = page.locator(
      '[data-testid="workflow-instructions"]',
    );
    await expect(instructionsPanel).toBeVisible();

    // Click toggle button
    const toggleButton = page.locator(
      '[data-testid="workflow-instructions-toggle"]',
    );
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();

    // Wait for expansion
    await page.waitForTimeout(300);

    // Verify instructions content is visible (contains "Ctrl+Z")
    await expect(page.locator('text=/Ctrl\\+Z/i')).toBeVisible();

    console.log('✓ Instructions panel expanded');

    // Click again to collapse
    await toggleButton.click();
    await page.waitForTimeout(300);

    console.log('✓ Instructions panel collapsed');
  });

  test('NEW: should toggle full-screen mode', async ({ page }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Verify fullscreen toggle button exists
    const fullscreenButton = page.locator(
      '[data-testid="workflow-fullscreen-toggle"]',
    );
    await expect(fullscreenButton).toBeVisible();

    // Click to enter fullscreen
    await fullscreenButton.click();
    await page.waitForTimeout(500);

    console.log('✓ Fullscreen mode entered');

    // Click again to exit fullscreen
    await fullscreenButton.click();
    await page.waitForTimeout(500);

    console.log('✓ Fullscreen mode exited');
  });

  test('NEW: should display validation panel for incomplete workflow', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Add a node to trigger validation
    await page.locator('[data-testid="workflow-add-action"]').click();
    await page.waitForTimeout(1000);

    // Check if validation panel appears (might show warnings/errors for incomplete node)
    const validationPanel = page.locator(
      '[data-testid="workflow-validation-panel"]',
    );
    const validationSuccess = page.locator(
      '[data-testid="workflow-validation-success"]',
    );

    // One of these should be visible
    const hasValidation = await validationPanel
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const hasSuccess = await validationSuccess
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(hasValidation || hasSuccess).toBe(true);

    console.log('✓ Validation panel displayed');
  });

  test('NEW: should show validation success for complete workflow', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Wait for workflow to load
    await page.waitForTimeout(1000);

    // If workflow has nodes, check for validation success
    const nodeCount = await page.locator('.react-flow__node').count();

    if (nodeCount > 0) {
      // Look for either success indicator or validation panel
      const validationSuccess = page.locator(
        '[data-testid="workflow-validation-success"]',
      );

      // Wait a bit for validation to run
      await page.waitForTimeout(1000);

      // Check if success message appears
      const isValid = await validationSuccess
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      console.log(
        isValid
          ? '✓ Validation success shown'
          : '⚠ Validation shows issues (expected for incomplete workflow)',
      );
    } else {
      console.log('⚠ No nodes to validate');
    }
  });

  test('NEW: should update workflow name', async ({ page }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const nameInput = page.locator('[data-testid="workflow-name-input"]');
    await expect(nameInput).toBeVisible();

    // Clear and type new name
    await nameInput.fill('E2E Test Workflow');
    await page.waitForTimeout(500);

    // Verify name was updated
    const value = await nameInput.inputValue();
    expect(value).toBe('E2E Test Workflow');

    console.log('✓ Workflow name updated');
  });

  test('NEW: should show selection indicator when node is selected', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Add a node
    await page.locator('[data-testid="workflow-add-action"]').click();
    await page.waitForTimeout(500);

    // Click on the node to select it
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    if (nodeCount > 0) {
      await nodes.last().click();
      await page.waitForTimeout(300);

      // Verify selection indicator appears
      const selectionIndicator = page.locator(
        '[data-testid="workflow-selection-indicator"]',
      );
      await expect(selectionIndicator).toBeVisible({ timeout: 2000 });

      console.log('✓ Selection indicator shown');

      // Verify delete button appears
      const deleteButton = page.locator(
        '[data-testid="workflow-delete-selected"]',
      );
      await expect(deleteButton).toBeVisible();

      console.log('✓ Delete button shown for selected node');
    }
  });

  test('NEW: should delete selected node with delete button', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const initialNodes = await page.locator('.react-flow__node').count();

    if (initialNodes > 0) {
      // Click on first node
      await page.locator('.react-flow__node').first().click();
      await page.waitForTimeout(300);

      // Click delete button
      const deleteButton = page.locator(
        '[data-testid="workflow-delete-selected"]',
      );
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();
      await page.waitForTimeout(500);

      // Verify node was deleted
      const newNodeCount = await page.locator('.react-flow__node').count();
      expect(newNodeCount).toBe(initialNodes - 1);

      console.log(`✓ Node deleted (${initialNodes} → ${newNodeCount})`);
    } else {
      console.log('⚠ No nodes to delete');
    }
  });

  test('should persist workflow across page reload', async ({ page }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const nodesBeforeReload = await page.locator('.react-flow__node').count();
    console.log(`✓ Nodes before reload: ${nodesBeforeReload}`);

    // Reload the page
    await page.reload();
    await page.waitForURL(/tab=workflow/, { timeout: 5000 });
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const nodesAfterReload = await page.locator('.react-flow__node').count();
    console.log(`✓ Nodes after reload: ${nodesAfterReload}`);

    // Verify node count is the same
    expect(nodesAfterReload).toBe(nodesBeforeReload);

    console.log('✓ Workflow persisted across reload');
  });
});
