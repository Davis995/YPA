import { m } from 'framer-motion';
import { useEffect, useState } from 'react';

type TypewriterProps = {
	words: string[];
	speedMs?: number;
	pauseMs?: number;
};

export const Typewriter = ({ words, speedMs = 60, pauseMs = 1200 }: TypewriterProps) => {
	const [index, setIndex] = useState(0);
	const [display, setDisplay] = useState('');
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const current = words[index % words.length];
		let timeout: number | undefined;

		if (!deleting && display.length < current.length) {
			timeout = window.setTimeout(() => setDisplay(current.slice(0, display.length + 1)), speedMs);
		} else if (!deleting && display.length === current.length) {
			timeout = window.setTimeout(() => setDeleting(true), pauseMs);
		} else if (deleting && display.length > 0) {
			timeout = window.setTimeout(() => setDisplay(current.slice(0, display.length - 1)), speedMs / 1.5);
		} else if (deleting && display.length === 0) {
			setDeleting(false);
			setIndex((i) => (i + 1) % words.length);
		}

		return () => clearTimeout(timeout);
	}, [display, deleting, index, pauseMs, speedMs, words]);

	return (
		<m.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center">
			{display}
			<span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-slate-200" />
		</m.span>
	);
};



