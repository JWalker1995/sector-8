#!/bin/sh

# Is this generating the deps.js file twice? If so, TODO fix

when-changed -r js/sector8/ \
    python js/closure-library/closure/bin/build/depswriter.py \
        --root_with_prefix="js/util/\ ../../../util/" \
        --root_with_prefix="js/sector8/\ ../../../sector8/" \
        --output_file=js/deps.js \
    && \
    python js/closure-library/closure/bin/build/closurebuilder.py \
        --root=js/closure-library/ \
        --root=js/util/ \
        --root=js/sector8/ \
        --namespace="goog.dom" \
        --namespace="sector8.core" \
        --namespace="sector8.game" \
        --output_mode=script \
        --compiler_jar=/home/joel/source/closure-compiler/build/compiler.jar \
        --compiler_flags="" \
        --output_file=js/bundle.js \

