"use client";

import React from "react";
import { SiSololearn } from "react-icons/si";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { motion, AnimatePresence } from "framer-motion";

const HeaderLogo = () => {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<div
			className={`w-full h-auto flex justify-center items-center gap-4 ${!isCollapsed ? "px-4" : "py-1"}`}
		>
			<motion.div
				animate={{
					scale: isCollapsed ? 0.8 : 1,
					width: isCollapsed ? 24 : 40,
				}}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="flex justify-center items-center"
			>
				<SiSololearn className="w-full h-full min-w-6 text-primary" />
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
						<h1 className="text-2xl font-bold text-foreground">
							Warranty
						</h1>
						<p className="text-sm text-muted-foreground">
							Management | Admin
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default HeaderLogo;
