import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext.jsx";

export default function FeatureGate({
  flag,
  children,
  fallback = <Navigate to="/home" replace />,
}) {
  const { isEnabled } = useFeatureFlags();

  if (isEnabled(flag)) {
    return children;
  }

  return fallback;
}

FeatureGate.propTypes = {
  flag: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};
