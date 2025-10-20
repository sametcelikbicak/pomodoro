import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders all social links', () => {
    render(<Footer />);

    // Check for GitHub link
    const githubLink = screen.getByLabelText('GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/sametcelikbicak'
    );

    // Check for LinkedIn link
    const linkedinLink = screen.getByLabelText('LinkedIn');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/sametcelikbicak/'
    );

    // Check for X (Twitter) link
    const xLink = screen.getByLabelText('X');
    expect(xLink).toBeInTheDocument();
    expect(xLink).toHaveAttribute('href', 'https://x.com/sametcelikbicak');

    // Check for YouTube link
    const youtubeLink = screen.getByLabelText('YouTube');
    expect(youtubeLink).toBeInTheDocument();
    expect(youtubeLink).toHaveAttribute(
      'href',
      'https://www.youtube.com/@sametcelikbicak'
    );

    // Check for Stack Overflow link
    const stackOverflowLink = screen.getByLabelText('Stack Overflow');
    expect(stackOverflowLink).toBeInTheDocument();
    expect(stackOverflowLink).toHaveAttribute(
      'href',
      'https://stackoverflow.com/users/10509056/samet-%c3%87el%c4%b0kbi%c3%87ak'
    );
  });

  it('renders all social links with correct attributes', () => {
    render(<Footer />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders with correct footer styles', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass(
      'text-center',
      'text-text-secondary',
      'text-xs',
      'border-t',
      'border-gray-200',
      'my-2'
    );
  });
});
