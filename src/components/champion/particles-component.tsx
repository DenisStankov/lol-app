"use client"
import { useEffect, useMemo, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import type { Container, ISourceOptions } from "@tsparticles/engine"
import { loadSlim } from "@tsparticles/slim"

interface ParticlesComponentProps {
  championTheme: string
  primaryColor: string
  secondaryColor: string
}

export function ParticlesComponent({ championTheme, primaryColor, secondaryColor }: ParticlesComponentProps) {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // console.log(container);
  }

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent", // Handled by page background
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: false,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "grab", // "repulse" or "bubble" could also be cool
          },
        },
        modes: {
          push: {
            quantity: 2,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          grab: {
            distance: 150,
            links: {
              opacity: 0.3,
              color: primaryColor,
            },
          },
        },
      },
      particles: {
        color: {
          value: [primaryColor, secondaryColor], // Array of colors for variety
        },
        links: {
          color: secondaryColor,
          distance: 150,
          enable: championTheme === "cosmic" || championTheme === "arcane", // Only for certain themes
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out", // "bounce" or "out"
          },
          random: true,
          speed: 0.5, // Slower, more ethereal
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800, // Adjust for desired density
          },
          value: championTheme === "cosmic" ? 80 : 50, // More particles for cosmic
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: 0.1,
            sync: false,
          },
        },
        shape: {
          type: championTheme === "fire" ? "circle" : "star", // "circle", "square", "triangle", "polygon", "star", "image"
          options: {
            star: {
              sides: 5,
            },
          },
        },
        size: {
          value: { min: 1, max: championTheme === "cosmic" ? 3 : 2 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 0.5,
            sync: false,
          },
        },
      },
      detectRetina: true,
    }),
    [championTheme, primaryColor, secondaryColor],
  )

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="fixed top-0 left-0 w-full h-full z-0"
      />
    )
  }

  return null
} 