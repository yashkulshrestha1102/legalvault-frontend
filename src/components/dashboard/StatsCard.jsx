import { FaArrowUp } from "react-icons/fa";
import { motion } from "framer-motion";

function StatsCard({
  title,
  value,
  growth,
  icon,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{
        duration: 0.4,
      }}
      className="
      glass-card
      relative
      overflow-hidden
      p-7
      "
    >
      {/* Glow Effect */}

      <div
        className="
        absolute
        -top-10
        -right-10
        w-32
        h-32
        bg-cyan-500/20
        rounded-full
        blur-3xl
      "
      />

      {/* Top */}

      <div className="flex justify-between items-center relative z-10">

        <div>

          <p
            className="
            text-slate-400
            text-sm
            uppercase
            tracking-wider
          "
          >
            {title}
          </p>

          <h2
            className="
            text-5xl
            md:text-6xl
            font-black
            mt-3
          "
          >
            {value}
          </h2>

        </div>

        <div
          className="
          w-16
          h-16
          rounded-2xl
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          flex
          items-center
          justify-center
          text-cyan-400
          text-2xl
        "
        >
          {icon}
        </div>

      </div>

      {/* Bottom */}

      <div className="mt-6 relative z-10">

        <div className="flex items-center gap-2">

          <FaArrowUp
            className="
            text-green-400
            text-xs
          "
          />

          <span
            className="
            text-green-400
            font-semibold
          "
          >
            +{growth}%
          </span>

          <span
            className="
            text-slate-400
            text-sm
          "
          >
            this month
          </span>

        </div>

        {/* Progress */}

        <div
          className="
          mt-4
          h-2
          rounded-full
          bg-white/5
          overflow-hidden
        "
        >

          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${growth}%`,
            }}
            transition={{
              duration: 1,
            }}
            className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-cyan-400
            via-blue-500
            to-purple-500
          "
          />

        </div>

      </div>

    </motion.div>
  );
}

export default StatsCard;