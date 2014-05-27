#!/bin/sh

sass --scss --update css:css
python js/closure-library/closure/bin/build/closurebuilder.py --root=js/closure-library/ --root=js/util/ --root=js/sector8/ --namespace="goog.dom" --namespace="sector8.core" --namespace="sector8.game" --output_mode=compiled --compiler_jar=/home/joel/source/closure-compiler/build/compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" --output_file=js/bundle.js
