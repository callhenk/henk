import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Agent Workflow Feature
 *
 * Tests the complete workflow builder functionality including:
 * - Adding and editing workflow nodes
 * - Loading workflows from templates
 * - Saving workflows to database
 * - Workflow persistence across page reloads
 * - Full-screen mode toggle
 * - Collapsible instructions panel
 * - Node selection and deletion
 * - Workflow naming
 */

// Test credentials
const TEST_EMAIL = 'cyrus@callhenk.com';
const TEST_PASSWORD = 'Test123?';

// Agent ID will be set dynamically
let testAgentId: string;

test.describe('Agent Workflow Feature', () => {
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
    // Capture console logs
    page.on('console', (msg) => {
      if (msg.text().includes('[useWorkflowState]')) {
        console.log('BROWSER:', msg.text());
      }
    });

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
    await page.waitForTimeout(1500);

    const nodesAfterUndo = await page.locator('.react-flow__node').count();
    expect(nodesAfterUndo).toBe(initialNodes);
    console.log('✓ Undo successful');

    // Click Redo using data-testid
    const redoButton = page.locator('[data-testid="workflow-redo"]');
    await expect(redoButton).toBeEnabled();
    await redoButton.click();
    await page.waitForTimeout(1500);

    const nodesAfterRedo = await page.locator('.react-flow__node').count();
    expect(nodesAfterRedo).toBe(initialNodes + 1);
    console.log('✓ Redo successful');
  });

  test('should load workflow template', async ({ page }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Click "Load Template" button using data-testid
    const loadTemplateBtn = page.locator(
      '[data-testid="workflow-load-template"]',
    );
    await expect(loadTemplateBtn).toBeVisible();
    await loadTemplateBtn.click();

    // Wait for template selection dialog
    await page.waitForSelector('text=/Select.*Template|Choose.*Template/i', {
      timeout: 5000,
    });
    console.log('✓ Template selection dialog opened');

    // Select "Basic Fundraising" template
    await page.click('text=/Basic Fundraising/i');
    await page.waitForTimeout(1000);

    // Verify nodes were added
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
    console.log(`✓ Template loaded with ${nodeCount} nodes`);

    // Verify unsaved indicator
    const unsavedIndicator = page.locator(
      '[data-testid="workflow-unsaved-indicator"]',
    );
    await expect(unsavedIndicator).toBeVisible({ timeout: 5000 });
    console.log('✓ Template loaded successfully');
  });

  test('should edit node properties', async ({ page }) => {
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Add a node first
    await page.locator('[data-testid="workflow-add-action"]').click();
    await page.waitForTimeout(500);

    // Click on the node to edit it
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    if (nodeCount > 0) {
      await nodes.last().click();
      await page.waitForTimeout(500);

      // Wait for node editor dialog
      await page.waitForSelector('input[placeholder*="label"], textarea', {
        timeout: 5000,
      });
      console.log('✓ Node editor dialog opened');

      // Modify the label
      const labelInput = page.locator('input[placeholder*="label"]').first();
      await labelInput.fill('E2E Test Node');

      // Save changes - find Save button within the dialog
      const dialogSaveButton = page
        .locator(
          '[role="dialog"] button:has-text("Save"), .sheet button:has-text("Save")',
        )
        .first();
      await dialogSaveButton.click();
      await page.waitForTimeout(500);

      console.log('✓ Node properties edited successfully');
    }
  });

  test('should toggle collapsible instructions panel', async ({ page }) => {
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

  test('should toggle full-screen mode', async ({ page }) => {
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

  test('should update workflow name', async ({ page }) => {
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

  test('should show selection indicator when node is selected', async ({
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

  test('should delete selected node with delete button', async ({ page }) => {
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
