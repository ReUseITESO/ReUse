// Scaffolding: login page stub. Add a LoginForm component when core auth is ready.
// See reglas_de_escritura_front.md section 3 (Pages) for page conventions.
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Iniciar sesion | ReUseITESO",
	description: "Inicia sesion en ReUseITESO con tu cuenta de estudiante",
};

export default function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center p-8">
			<div className="w-full max-w-md">
				<h1 className="mb-6 text-center text-2xl font-bold">Iniciar sesion</h1>
				{/* TODO: add LoginForm component */}
			</div>
		</main>
	);
}
