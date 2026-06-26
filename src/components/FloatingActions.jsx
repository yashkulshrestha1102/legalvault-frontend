import { useState } from "react";
import {
  FaPlus,
  FaUserPlus,
  FaGavel,
  FaFileAlt,
  FaBook,
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";

function FloatingActions() {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: "Add Client",
      icon: <FaUserPlus />,
    },
    {
      label: "Add Case",
      icon: <FaGavel />,
    },
    {
      label: "Add Document",
      icon: <FaFileAlt />,
    },
    {
      label: "Add Policy",
      icon: <FaBook />,
    },
  ];

  return (
    <div
className="
fixed
bottom-6
right-6
md:bottom-8
md:right-8
z-30
"
>

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 30,
            }}
            className="
            flex
            flex-col
            gap-3
            mb-4
            "
          >

            {actions.map(
              (action, index) => (

                <motion.button
                  key={index}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  className="
                  glass-card
                  px-5
                  py-3
                  flex
                  items-center
                  gap-3
                  text-sm
                  font-medium
                  shadow-lg
                  "
                >
                  <span className="text-cyan-400">
                    {action.icon}
                  </span>

                  {action.label}
                </motion.button>

              )
            )}

          </motion.div>

        )}

      </AnimatePresence>

      <motion.button
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.95,
        }}
        onClick={() =>
          setOpen(!open)
        }
        className="
        glass
        w-16
        h-16
        rounded-full
        flex
        items-center
        justify-center
        text-2xl
        blue-glow
        "
      >
        <motion.div
          animate={{
            rotate: open
              ? 45
              : 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <FaPlus />
        </motion.div>
      </motion.button>

    </div>
  );
}

export default FloatingActions;