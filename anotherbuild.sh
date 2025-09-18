#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
npx x3d-tidy@latest -i data/walking_man_v2.x3dv -o data/walking_man_v2.x3d
sed \
	-e "s/\(<HAnimJoint.*DEF='CC_\)\([^']*\)'/\1\2' name='\2'/" \
	-e "s/\(<HAnimJoint.*DEF='Sunglasses\)\([^']*\)'/\1\2' name='Sunglasses\2'/" \
	-e "s/\(<HAnimJoint.*DEF='hanim_\)\([^']*\)'/\1\2' name='\2'/" \
	-e "s/<HAnimHumanoid DEF='HAnimHumanoid'/<HAnimHumanoid DEF='hanim_humanoid' name='humanoid'/" \
	-e 's/<\([^<]*WalkTimer[^>]*\)>/!--\1--/' \
	-e 's/<\([^<]*expression[^>]*\)>/!--\1--/' \
	< data/walking_man_v2.x3d > data/walking_named.x3d

export PROCESSORS="${PROCESSORS-8}"

pushd shell
bash several.sh ../data/walking_named.x3d
popd

sed \
	-e "s/\(.*<ImageTexture.*DEF='[^']*Diffuse'\)/\1 containerField='emissiveTexture'/" \
	-e "s/\(.*<ImageTexture.*DEF='[^']*Specular'\)/\1 containerField='specularTexture'/" \
	-e "s/\(.*<ImageTexture.*DEF='[^']*Normal'\)/\1 containerField='normalTexture'/" \
	-e "s/\(.*<ImageTexture.*DEF='[^']*Base'\)/\1 containerField='baseTexture'/" \
	-e "s/\(.*<ImageTexture.*DEF='[^']*Opacity'\)/\1 containerField='baseTexture'/" \
	-e "s/\(.*<ImageTexture.*DEF='[^']*Occlusion'\)/\1 containerField='baseTexture'/" \
	-e "s/\(.*<ImageTexture.*DEF='[^']*Reflection'\)/\1 containerField='occlusionTexture'/" \
	-e "s/\(.*<Shape.*DEF='[^']*Shape'\)/\1 containerField='skin'/" \
	-e "s/\(.*<Group.*DEF='[^']*Shape'\)/\1 containerField='skin'/" \
	-e "s/<Shape DEF='Punk_Leather_JacketShape' containerField='skin' containerField='skin'/<Shape DEF='Punk_Leather_JacketShape' containerField='skin'/" \
	< data/humanoid.scaled1.x3d > data/walking_named_scaled.x3d
	# -e "s/\(.*<Group.*DEF='[^']*Group'\)/\1 containerField='skin'/" \
