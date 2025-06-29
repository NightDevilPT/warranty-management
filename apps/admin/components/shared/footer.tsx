"use client";

import React from "react";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaInfoCircle, FaEnvelope } from "react-icons/fa";

const Footer = () => {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<div
			className={`w-full h-auto flex justify-center items-center gap-3 ${!isCollapsed ? "px-4" : "py-1"}`}
		>
			<motion.div
				animate={{
					scale: isCollapsed ? 0.8 : 1,
					width: isCollapsed ? 20 : 32,
				}}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="flex justify-center items-center"
			>
				<FaInfoCircle className="w-full h-full min-w-5 text-primary" />
			</motion.div>
			<AnimatePresence>
				{!isCollapsed && (
					<motion.div
						className="flex-1 flex justify-center items-start flex-col"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -10 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<p className="text-sm font-medium text-foreground">
							Support
						</p>
						<a
							href="mailto:support@warranty.com"
							className="text-xs text-muted-foreground hover:text-primary"
						>
							support@warranty.com
						</a>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Footer;
