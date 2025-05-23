import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import AppFunctional from "./AppFunctional";
import '@testing-library/jest-dom';
import axios from "axios";
jest.mock('axios');

describe('AppFunctional Component', () => {
  // Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

// Test 1: Pass
test('renders initial texts correctly', () => {
  render(<AppFunctional />);

  expect(screen.getByText('LEFT')).toBeInTheDocument();
  expect(screen.getByText('UP')).toBeInTheDocument();
  expect(screen.getByText('RIGHT')).toBeInTheDocument();
  expect(screen.getByText('DOWN')).toBeInTheDocument();
  expect(screen.getByText('reset')).toBeInTheDocument();

  const emailInput = screen.getByPlaceholderText('type email');
  expect(emailInput).toBeInTheDocument();
  expect(emailInput).toHaveValue('');
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  expect(screen.getByTestId('message')).toBeEmptyDOMElement();
  });

// Test 2: Pass
test('typing in email input changes its value', () => {
  render(<AppFunctional />);

  const emailInput = screen.getByPlaceholderText('type email');

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  expect(emailInput).toHaveValue('test@example.com');

  fireEvent.change(emailInput, { target: { value: 'another@email.org' } });
    expect(emailInput).toHaveValue('another@email.org');
});

// Test 3: Pass
test('moving "B" updates coordinates and steps', () => {
    render(<AppFunctional />);

    const leftButton = screen.getByText('LEFT');
    const upButton = screen.getByText('UP');
    const coordinatesDisplay = screen.getByText(/coordinates/i);
    const stepsDisplay = screen.getByText(/you moved/i);
    const B_square = screen.getByText('B').closest('.square');

    expect(coordinatesDisplay).toHaveTextContent('Coordinates (2, 2)');
    expect(stepsDisplay).toHaveTextContent('You moved 0 times');
    expect(B_square).toHaveClass('active');

    fireEvent.click(leftButton);
    expect(coordinatesDisplay).toHaveTextContent('Coordinates (1, 2)');
    expect(stepsDisplay).toHaveTextContent('You moved 1 time');
    expect(screen.getByText('B').closest('.square')).toHaveClass('active');

    fireEvent.click(upButton);
    expect(coordinatesDisplay).toHaveTextContent('Coordinates (1, 1)');
    expect(stepsDisplay).toHaveTextContent('You moved 2 times');
    expect(screen.getByText('B').closest('.square')).toHaveClass('active');

    fireEvent.click(upButton);
    expect(screen.getByTestId('message')).toHaveTextContent("You can't go up");
    expect(coordinatesDisplay).toHaveTextContent('Coordinates (1, 1)'); 
    expect(stepsDisplay).toHaveTextContent('You moved 2 times');
  });

// Test 4: Pass
test('reset button restores initial state', () => {
    render(<AppFunctional />);

    const leftButton = screen.getByText('LEFT');
    const upButton = screen.getByText('UP');
    const resetButton = screen.getByText('reset');
    const emailInput = screen.getByPlaceholderText('type email');
    const messageDisplay = screen.getByTestId('message');

    fireEvent.click(leftButton);
    fireEvent.click(upButton);  
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(upButton); 

    // Assert that state has changed from initial
    expect(screen.getByText('Coordinates (1, 1)')).toBeInTheDocument();
    expect(screen.getByText('You moved 2 times')).toBeInTheDocument();
    expect(messageDisplay).toHaveTextContent("You can't go up");
    expect(emailInput).toHaveValue('test@example.com');
    expect(screen.getByText('B').closest('.square')).toHaveClass('active');


    // Click reset button
    fireEvent.click(resetButton);

    // Assert state is restored to initial
    expect(screen.getByText('Coordinates (2, 2)')).toBeInTheDocument();
    expect(screen.getByText('You moved 0 times')).toBeInTheDocument();
    expect(emailInput).toHaveValue(''); // Email should be reset
    expect(messageDisplay).toBeEmptyDOMElement(); // Message should be cleared
    expect(screen.getByText('B').closest('.square')).toHaveClass('active'); // B should be back at (2,2)
  });

// Test 5: 
test('displays a message after email submission (success or failure)', async () => {
    render(<AppFunctional />);

    const emailInput = screen.getByPlaceholderText('type email');
    const submitButton = screen.getByRole('button', { name: /submit/i });
    const messageDisplay = screen.getByTestId('message'); // Get the element to check its content

    // --- Scenario A: Successful submission ---
    axios.post.mockResolvedValueOnce({
      data: { message: 'Submission successful!' }, // Simple success message
    });

    fireEvent.change(emailInput, { target: { value: 'success@example.com' } });
    fireEvent.click(submitButton);

    // Wait for the message display to have *any* text content
    await waitFor(() => {
      expect(messageDisplay).not.toBeEmptyDOMElement();
      expect(messageDisplay).toHaveTextContent('Submission successful!'); // Optional: confirm the specific message
    }, { timeout: 3000 }); // Give it enough time

    // Optionally, clear the message if your component has a way to do so,
    // or simulate an action that would clear it (e.g., typing in email again)
    fireEvent.change(emailInput, { target: { value: 'clear@example.com' } });
    await waitFor(() => {
        expect(messageDisplay).toBeEmptyDOMElement();
    }, { timeout: 2000 }); // Wait for the message to clear

    // --- Scenario B: Failed submission ---
    axios.post.mockResolvedValueOnce({
      data: { message: 'Submission failed!' }, // Simple failure message
    });

    fireEvent.change(emailInput, { target: { value: 'fail@example.com' } });
    fireEvent.click(submitButton);

    // Wait for the message display to have *any* text content for failure
    await waitFor(() => {
      expect(messageDisplay).not.toBeEmptyDOMElement();
      expect(messageDisplay).toHaveTextContent('Submission failed!'); // Optional: confirm the specific message
    }, { timeout: 3000 });
  });
});
