
import React from "react";
import "./feature.css";

type FeatureProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
};

export default function Feature({ icon, title, description }: FeatureProps) {
	return (
		<div className="feature-root">
			<div className="feature-icon">{icon}</div>
			<h3 className="feature-title">{title}</h3>
			<p className="feature-desc">{description}</p>
		</div>
	);
}
